'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/firebase/auth';
import { getDocument, setDocument, COLLECTIONS, serverTimestamp } from '@/lib/firebase/firestore';
import { Employee } from '@/types/employee';

// ─── Types ───────────────────────────────────────────────────────

interface AuthContextType {
    user: User | null;
    employee: Employee | null;
    loading: boolean;
    isAuthenticated: boolean;
    profileComplete: boolean;
    refreshEmployee: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
    user: null,
    employee: null,
    loading: true,
    isAuthenticated: false,
    profileComplete: false,
    refreshEmployee: async () => { },
});

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Check if user has an employee profile in Firestore
                    let employeeProfile = await getDocument<Employee>(
                        COLLECTIONS.EMPLOYEES,
                        firebaseUser.uid
                    );

                    // If no profile exists, do NOT auto-create one.
                    // Let the register page handle profile completion.
                    if (!employeeProfile) {
                        setEmployee(null);
                        setProfileComplete(false);
                    } else {
                        // Sync avatar & name from Firebase Auth if missing, and update last_active
                        const updates: Record<string, unknown> = {
                            last_active: serverTimestamp(),
                        };

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

                        await setDocument(
                            COLLECTIONS.EMPLOYEES,
                            firebaseUser.uid,
                            updates,
                            true
                        ).catch(() => {
                            // Silently fail — not critical
                        });

                        setEmployee(employeeProfile);
                        setProfileComplete(true);
                    }
                } catch (error) {
                    console.error('Error fetching employee profile:', error);
                    // Still allow auth to proceed even if Firestore fails
                    setEmployee(null);
                    setProfileComplete(false);
                }
            } else {
                setEmployee(null);
                setProfileComplete(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Function to re-fetch the employee profile (e.g. after completing registration)
    const refreshEmployee = async () => {
        if (user) {
            try {
                const employeeProfile = await getDocument<Employee>(
                    COLLECTIONS.EMPLOYEES,
                    user.uid
                );
                if (employeeProfile) {
                    setEmployee(employeeProfile);
                    setProfileComplete(true);
                }
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
