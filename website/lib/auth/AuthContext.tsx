'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, logout } from '@/lib/firebase/auth';
import { listenToDocument, setDocument, COLLECTIONS, serverTimestamp } from '@/lib/firebase/firestore';
import { Employee } from '@/types/employee';

// ─── Types ───────────────────────────────────────────────────────

interface AuthContextType {
    user: User | null;
    employee: Employee | null;
    loading: boolean;
    isAuthenticated: boolean;
    profileComplete: boolean;
    isApproved: boolean;
    refreshEmployee: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
    user: null,
    employee: null,
    loading: true,
    isAuthenticated: false,
    profileComplete: false,
    isApproved: false,
    refreshEmployee: async () => { },
});

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [employeeListenerUnsubscribe, setEmployeeListenerUnsubscribe] = useState<(() => void) | null>(null);

    // Function to handle employee document updates (including deletion)
    const handleEmployeeUpdate = useCallback(async (employeeProfile: Employee | null, firebaseUser: User) => {
        if (!employeeProfile) {
            // Employee document was deleted (admin deleted user) - log out immediately
            console.log('Employee document deleted - logging out user');
            setEmployee(null);
            setProfileComplete(false);
            setIsApproved(false);
            
            // Log out the user and redirect to login
            try {
                await logout();
                window.location.href = '/login';
            } catch (error) {
                console.error('Error logging out deleted user:', error);
            }
            return;
        }

        // Update last_active timestamp periodically (not on every listener update to avoid loops)
        const shouldUpdateLastActive = !employeeProfile.last_active || 
            (new Date().getTime() - new Date(employeeProfile.last_active).getTime() > 60000); // Only update if > 1 min old

        const updates: Record<string, unknown> = {};
        
        if (shouldUpdateLastActive) {
            updates.last_active = serverTimestamp();
        }

        // Sync Google profile photo if employee doesn't have one
        if (!employeeProfile.avatar_url && firebaseUser.photoURL) {
            updates.avatar_url = firebaseUser.photoURL;
            employeeProfile = { ...employeeProfile, avatar_url: firebaseUser.photoURL };
        }

        // Sync display name if employee doesn't have one
        if ((!employeeProfile.name || employeeProfile.name === 'New User') && firebaseUser.displayName) {
            updates.name = firebaseUser.displayName;
            employeeProfile = { ...employeeProfile, name: firebaseUser.displayName };
        }

        // Migration: Set approvalStatus to 'approved' for existing users without it
        if (!employeeProfile.approvalStatus) {
            updates.approvalStatus = 'approved';
            employeeProfile = { ...employeeProfile, approvalStatus: 'approved' };
        }

        // Only update Firestore if there are changes
        if (Object.keys(updates).length > 0) {
            await setDocument(
                COLLECTIONS.EMPLOYEES,
                firebaseUser.uid,
                updates,
                true
            ).catch(() => {
                // Silently fail — not critical
            });
        }

        setEmployee(employeeProfile);
        setProfileComplete(true);
        setIsApproved(employeeProfile.approvalStatus === 'approved');
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Clean up previous listener if exists
                if (employeeListenerUnsubscribe) {
                    employeeListenerUnsubscribe();
                }

                // Set up real-time listener for employee document
                const unsubscribeEmployee = listenToDocument<Employee>(
                    COLLECTIONS.EMPLOYEES,
                    firebaseUser.uid,
                    (employeeProfile) => {
                        handleEmployeeUpdate(employeeProfile, firebaseUser);
                        setLoading(false);
                    }
                );

                setEmployeeListenerUnsubscribe(() => unsubscribeEmployee);
            } else {
                // User logged out - clean up
                if (employeeListenerUnsubscribe) {
                    employeeListenerUnsubscribe();
                    setEmployeeListenerUnsubscribe(null);
                }
                setEmployee(null);
                setProfileComplete(false);
                setIsApproved(false);
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            if (employeeListenerUnsubscribe) {
                employeeListenerUnsubscribe();
            }
        };
    }, [handleEmployeeUpdate]);

    // Function to re-fetch the employee profile (manual refresh)
    const refreshEmployee = async () => {
        if (user) {
            try {
                // This will trigger the listener to update
                // Just calling to ensure sync, the listener will handle the rest
                console.log('Manual refresh requested');
            } catch (error) {
                console.error('Error refreshing employee profile:', error);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                employee,
                loading,
                isAuthenticated: !!user,
                profileComplete,
                isApproved,
                refreshEmployee,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
