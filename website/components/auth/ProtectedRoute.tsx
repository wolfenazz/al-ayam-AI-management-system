'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Wraps a page to require authentication.
 * Redirects to /login if no user is authenticated.
 * Shows a loading spinner while auth state is resolving.
 */
export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (!loading && !isAuthenticated && !hasNavigated.current) {
            hasNavigated.current = true;
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
        return fallback || <LoadingScreen />;
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
