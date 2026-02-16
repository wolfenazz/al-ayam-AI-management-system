'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import { resetPassword, getAuthErrorMessage } from '@/lib/firebase/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(email);
            setIsSent(true);
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            setError(getAuthErrorMessage(firebaseError.code || ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white">
            {/* Left: Branding Panel */}
            <AuthLeftPanel />

            {/* Right: Forgot Password Form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="w-full max-w-[480px] flex flex-col gap-8 animate-fade-in">

                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">newspaper</span>
                        <span className="text-2xl font-bold">Al-Ayyam AI</span>
                    </div>

                    {/* Back to Login */}
                    <Link
                        href="/login"
                        className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors w-fit"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Sign In
                    </Link>

                    {!isSent ? (
                        <>
                            {/* Header */}
                            <div>
                                <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <span className="material-symbols-outlined text-[28px]">lock_reset</span>
                                </div>
                                <h2 className="text-3xl font-bold text-text-primary mb-2">Forgot Password?</h2>
                                <p className="text-text-secondary">
                                    No worries! Enter your email address and we&apos;ll send you a link to reset your password.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-accent-red/5 border border-accent-red/20 rounded-lg text-accent-red text-sm animate-fade-in">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-text-primary" htmlFor="reset-email">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                        </div>
                                        <input
                                            id="reset-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                            placeholder="name@alayyam.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

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
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center animate-fade-in">
                            <div className="size-16 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green mx-auto mb-6">
                                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Check Your Email</h2>
                            <p className="text-text-secondary mb-6">
                                We&apos;ve sent a password reset link to{' '}
                                <span className="font-semibold text-text-primary">{email}</span>.
                                Please check your inbox and follow the instructions.
                            </p>
                            <p className="text-xs text-text-secondary mb-6">
                                Didn&apos;t receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setIsSent(false)}
                                    className="text-primary font-medium hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to Sign In
                            </Link>
                        </div>
                    )}

                    {/* Login Link */}
                    <p className="text-center text-sm text-text-secondary">
                        Remember your password?{' '}
                        <Link
                            href="/login"
                            className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
