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
}

// ─── Context ─────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
    user: null,
    employee: null,
    loading: true,
    isAuthenticated: false,
});

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

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

                    // If no profile exists, create a basic one
                    if (!employeeProfile) {
                        const newProfile: Omit<Employee, 'id'> = {
                            name: firebaseUser.displayName || 'New User',
                            email: firebaseUser.email || '',
                            role: 'Journalist',
                            status: 'ACTIVE',
                            availability: 'AVAILABLE',
                            created_at: new Date().toISOString(),
                            last_active: new Date().toISOString(),
                            avatar_url: firebaseUser.photoURL || '',
                        };

                        await setDocument(COLLECTIONS.EMPLOYEES, firebaseUser.uid, {
                            ...newProfile,
                            created_at: serverTimestamp(),
                            last_active: serverTimestamp(),
                        });

                        employeeProfile = { id: firebaseUser.uid, ...newProfile };
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
                    }

                    setEmployee(employeeProfile);
                } catch (error) {
                    console.error('Error fetching employee profile:', error);
                    // Still allow auth to proceed even if Firestore fails
                    setEmployee(null);
                }
            } else {
                setEmployee(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                employee,
                loading,
                isAuthenticated: !!user,
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
