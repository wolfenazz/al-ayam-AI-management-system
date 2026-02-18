'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { listenToDocument, COLLECTIONS } from '@/lib/firebase/firestore';
import { Employee } from '@/types/employee';
import { logout } from '@/lib/firebase/auth';
import { Ripple } from '@/components/ui/ripple';

export default function PendingApprovalPage() {
    const router = useRouter();
    const { user, employee, loading: authLoading, refreshEmployee } = useAuth();
    const [isRejected, setIsRejected] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const hasRedirected = useRef(false);

    // Real-time listener for approval status changes
    useEffect(() => {
        if (!user || hasRedirected.current) return;

        // Subscribe to real-time updates on the employee document
        const unsubscribe = listenToDocument<Employee>(
            COLLECTIONS.EMPLOYEES,
            user.uid,
            async (updatedEmployee) => {
                // Skip if already redirected or user is no longer authenticated
                if (hasRedirected.current || !user) return;
                
                if (updatedEmployee) {
                    setLastChecked(new Date());
                    
                    if (updatedEmployee.approvalStatus === 'approved') {
                        // Prevent multiple redirects
                        hasRedirected.current = true;

                        // First refresh the auth context to update isApproved state
                        await refreshEmployee();

                        // Redirect based on user role
                        // Admins and Managers go to /dashboard
                        // Other employees go to /employees-dashboard
                        const dashboardPath = ['Admin', 'Manager'].includes(updatedEmployee.role)
                            ? '/dashboard'
                            : '/employees-dashboard';

                        // Use window.location for a full page reload to ensure
                        // all components get fresh auth state
                        window.location.href = dashboardPath;
                    } else if (updatedEmployee.approvalStatus === 'rejected') {
                        // User has been rejected
                        setIsRejected(true);
                    }
                } else {
                    // Employee document no longer exists (user deleted)
                    // AuthContext will handle the logout
                    console.log('Employee document no longer exists');
                }
            },
            (error) => {
                // Handle permission errors gracefully
                // This happens when user is logged out but listener is still active
                if (error.message?.includes('permission-denied')) {
                    console.log('Permission denied - user likely logged out');
                } else {
                    console.error('Error in employee listener:', error);
                }
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user, refreshEmployee]);

    // If not authenticated, redirect to login
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleReRegister = async () => {
        // Logout and redirect to registration with full page reload
        // This ensures all listeners are properly cleaned up
        await logout();
        window.location.href = '/register';
    };

    if (authLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Ripple Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Ripple mainCircleSize={400} mainCircleOpacity={0.08} numCircles={6} />
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/images/alayam-logo-small.webp"
                        alt="Al-Ayyam Logo"
                        width={100}
                        height={100}
                        className="object-contain mb-4"
                        priority
                    />
                    <h1 className="text-2xl font-bold text-text-primary">AI Platform</h1>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                    {isRejected ? (
                        // Rejected State
                        <>
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-accent-red/10 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-accent-red">block</span>
                                </div>
                                <h2 className="text-xl font-bold text-text-primary mb-2">Account Rejected</h2>
                                <p className="text-text-secondary text-center text-sm">
                                    Your account registration has been rejected by the administrator.
                                </p>
                            </div>

                            <div className="bg-surface rounded-lg p-4 mb-6">
                                <p className="text-sm text-text-secondary text-center">
                                    You can re-register with different information or contact support for assistance.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleReRegister}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    Re-register
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-text-secondary bg-surface hover:bg-border border border-border transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </div>
                        </>
                    ) : (
                        // Pending State
                        <>
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-accent-orange/10 flex items-center justify-center mb-4 relative">
                                    <span className="material-symbols-outlined text-4xl text-accent-orange">hourglass_empty</span>
                                    <div className="absolute inset-0 rounded-full border-2 border-accent-orange/30 animate-ping" />
                                </div>
                                <h2 className="text-xl font-bold text-text-primary mb-2">Pending Approval</h2>
                                <p className="text-text-secondary text-center text-sm">
                                    Your account is awaiting approval from an administrator.
                                </p>
                            </div>

                            <div className="bg-surface rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">info</span>
                                    <span className="text-sm font-medium text-text-primary">What happens next?</span>
                                </div>
                                <ul className="space-y-2 text-sm text-text-secondary ml-8">
                                    <li className="flex items-start gap-2">
                                        <span className="text-accent-green mt-0.5">✓</span>
                                        <span>An admin will review your application</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-accent-green mt-0.5">✓</span>
                                        <span>You will be automatically redirected once approved</span>
                                    </li>
                                  
                                </ul>
                            </div>

                            {/* User Info */}
                            {employee && (
                                <div className="border-t border-border pt-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        {employee.avatar_url ? (
                                            <Image
                                                src={employee.avatar_url}
                                                alt={employee.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">person</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">{employee.name}</p>
                                            <p className="text-xs text-text-secondary truncate">{employee.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Indicator */}
                            <div className="flex items-center justify-between text-xs text-text-secondary mb-6">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                                    Waiting for approval
                                </span>
                                <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-text-secondary bg-surface hover:bg-border border border-border transition-all"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-text-secondary mt-6">
                    Al-Ayyam AI Platform • Need help? Contact your administrator
                </p>
            </div>
        </div>
    );
}
