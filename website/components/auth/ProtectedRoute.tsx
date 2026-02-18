'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { EmployeeRole } from '@/types/common';
import { Ripple } from '@/components/ui/ripple';

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
    const { isAuthenticated, loading, profileComplete, employee, isApproved } = useAuth();
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
            } else if (!isApproved && employee?.approvalStatus === 'pending') {
                // User is pending approval — redirect to pending approval page
                hasNavigated.current = true;
                router.push('/pending-approval');
            } else if (!isApproved && employee?.approvalStatus === 'rejected') {
                // User is rejected — redirect to pending approval page (shows rejected state)
                hasNavigated.current = true;
                router.push('/pending-approval');
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
    }, [isAuthenticated, loading, profileComplete, employee, router, allowedRoles, pathname, isApproved]);

    if (loading || !isAuthenticated || !profileComplete) {
        return fallback || <LoadingScreen />;
    }

    // Approval check for rendering (double check to prevent flash)
    if (!isApproved && (employee?.approvalStatus === 'pending' || employee?.approvalStatus === 'rejected')) {
        return fallback || <LoadingScreen />; // Keep loading state until redirect happens
    }

    // Role check for rendering (double check to prevent flash)
    if (allowedRoles && employee && !allowedRoles.includes(employee.role)) {
        return fallback || <LoadingScreen />; // Keep loading state until redirect happens
    }

    return <>{children}</>;
}

function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50 overflow-hidden">
            {/* MagicUI Ripple Effect - Full Page Background */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Ripple mainCircleSize={300} mainCircleOpacity={0.12} numCircles={8} />
            </div>
            
            {/* Content - Logo and Text */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                {/* Logo */}
                <div className="relative">
                    <Image
                        src="/images/alayam-logo-small.webp"
                        alt="Al-Ayyam Logo"
                        width={120}
                        height={48}
                        priority
                        className="object-contain"
                    />
                </div>
                
                <div className="flex flex-col items-center gap-1">
                    <h3 className="text-text-primary font-bold text-sm">AI Platform</h3>
                    <p className="text-text-secondary text-xs">Loading your workspace...</p>
                </div>
                
                <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
