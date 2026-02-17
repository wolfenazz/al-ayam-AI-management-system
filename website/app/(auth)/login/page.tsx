'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { loginWithEmail, loginWithGoogle, getAuthErrorMessage } from '@/lib/firebase/auth';
import { Globe } from '@/components/ui/globe';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading, profileComplete } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // If already authenticated, redirect to dashboard
    useEffect(() => {
        if (!authLoading && isAuthenticated && profileComplete) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, profileComplete, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        try {
            await loginWithEmail(email, password);
            router.push('/dashboard');
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            setError(getAuthErrorMessage(firebaseError.code || ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const credential = await loginWithGoogle();
            // Check if user has an employee profile
            const { getDocument, COLLECTIONS } = await import('@/lib/firebase/firestore');
            const existingProfile = await getDocument(COLLECTIONS.EMPLOYEES, credential.user.uid);
            if (existingProfile) {
                router.push('/dashboard');
            } else {
                // First-time Google user — redirect to complete registration
                router.push('/register?complete=google');
            }
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            setError(getAuthErrorMessage(firebaseError.code || ''));
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render the form if already authenticated
    if (authLoading || (isAuthenticated && profileComplete)) {
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
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white">
            {/* Left: Globe Panel */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col items-center justify-center bg-gray-50 overflow-hidden">
                <Globe className="top-1/2 -translate-y-1/2" />
                <div className="absolute bottom-24 z-10 pointer-events-none select-none w-full flex items-center justify-center gap-3">
                    <Image
                        src="/images/alayam-logo-small.webp"
                        alt="Al-Ayyam Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                        priority
                        style={{ width: 'auto', height: 'auto' }}
                    />
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 text-center whitespace-nowrap">
                        AI Platform
                    </h1>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="w-full max-w-[480px] flex flex-col gap-8 animate-fade-in">

                    {/* Mobile Logo */}

                    <div className="lg:hidden flex flex-col items-center gap-4">
                        <Image
                            src="/images/alayam-logo-small.webp"
                            alt="Al-Ayyam Logo"
                            width={250}
                            height={250}
                            className="object-contain"
                            priority
                            style={{ width: 'auto', height: 'auto' }}
                        />

                    </div>






                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-accent-red/5 border border-accent-red/20 rounded-lg text-accent-red text-sm animate-fade-in">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary" htmlFor="login-email">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                    placeholder="name@alayyam.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary" htmlFor="login-password">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                                </div>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none group" htmlFor="remember-me">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded cursor-pointer"
                                />
                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3.5 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 mt-2 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                    {/* Divider */}
                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-200" />
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with Gmail</span>
                        <div className="flex-grow border-t border-gray-200" />
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 w-full h-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-text-primary font-medium shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Sign in with Google</span>
                    </button>



                    {/* Registration Link */}
                    <p className="text-center text-sm text-text-secondary">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}


