'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { EmployeeRole } from '@/types/common';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    allowedRoles?: EmployeeRole[];
}

/**
 * Wraps a page to require authentication.
 * Redirects to /login if no user is authenticated.
 * Shows a loading spinner while auth state is resolving.
 * optional: allowedRoles - restricts access to specific employee roles.
 */
export default function ProtectedRoute({ children, fallback, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, loading, profileComplete, employee } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (!loading && !hasNavigated.current) {
            if (!isAuthenticated) {
                hasNavigated.current = true;
                router.push('/login');
            } else if (!profileComplete) {
                // Authenticated but no employee profile — redirect to complete registration
                hasNavigated.current = true;
                router.push('/register?complete=google');
            } else if (allowedRoles && employee && !allowedRoles.includes(employee.role)) {
                // User has a profile but not the required role
                hasNavigated.current = true;

                // Redirect logic based on role
                if (['Admin', 'Manager'].includes(employee.role)) {
                    // Admins/Managers trying to access restricted pages (unlikely but possible)
                    // If they are on employee dashboard and not allowed, send to main dashboard
                    if (pathname.startsWith('/employees-dashboard')) {
                        router.push('/dashboard');
                    }
                } else {
                    // Regular employees trying to access admin dashboard
                    if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/tasks')) { // tasks excluded if shared? No, separate dashboard.
                        router.push('/employees-dashboard');
                    } else {
                        // Generic unauthorized redirect
                        router.push('/unauthorized');
                    }
                }
            }
        }
    }, [isAuthenticated, loading, profileComplete, employee, router, allowedRoles, pathname]);

    if (loading || !isAuthenticated || !profileComplete) {
        return fallback || <LoadingScreen />;
    }

    // Role check for rendering (double check to prevent flash)
    if (allowedRoles && employee && !allowedRoles.includes(employee.role)) {
        return fallback || <LoadingScreen />; // Keep loading state until redirect happens
    }

    return <>{children}</>;
}

function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
            <div className="relative">
                <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[28px]">newspaper</span>
                </div>
                <div className="absolute -inset-2 rounded-xl border-2 border-primary/20 animate-ping" />
            </div>
            <div className="flex flex-col items-center gap-1 mt-2">
                <h3 className="text-text-primary font-bold text-sm">Al-Ayyam AI Platform</h3>
                <p className="text-text-secondary text-xs">Loading your workspace...</p>
            </div>
            <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}
