'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { registerWithEmail, loginWithGoogle, getAuthErrorMessage } from '@/lib/firebase/auth';
import { setDocument, getDocument, COLLECTIONS, serverTimestamp } from '@/lib/firebase/firestore';
import { Globe } from '@/components/ui/globe';
import Image from 'next/image';

const roleOptions = [
    { value: 'Editor', label: 'Editor', icon: 'edit', desc: 'Manage tasks & oversee content' },
    { value: 'Journalist', label: 'Journalist', icon: 'mic', desc: 'Field reporting & content creation' },
    { value: 'Photographer', label: 'Photographer', icon: 'photo_camera', desc: 'Visual media & photography' },
];

function RegisterPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, loading: authLoading, profileComplete, refreshEmployee } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '',
        department: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [step, setStep] = useState(1);

    // Google completion mode: user is authenticated via Google but has no profile
    const [googleCompleteMode, setGoogleCompleteMode] = useState(false);

    // Check if we're in Google completion mode
    useEffect(() => {
        const completeParam = searchParams.get('complete');
        if (completeParam === 'google' && isAuthenticated && !profileComplete && user) {
            setGoogleCompleteMode(true);
            // Pre-fill data from Google account
            setFormData((prev) => ({
                ...prev,
                fullName: user.displayName || '',
                email: user.email || '',
            }));
        }
    }, [searchParams, isAuthenticated, profileComplete, user]);

    // If already authenticated AND has a complete profile, redirect to dashboard
    useEffect(() => {
        if (!authLoading && isAuthenticated && profileComplete) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, profileComplete, router]);

    const update = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleStep1Next = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email) {
            setError('Please fill in your name and email.');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields.');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!formData.role) {
            setError('Please select a role.');
            return;
        }
        if (!acceptTerms) {
            setError('Please accept the Terms of Service and Privacy Policy.');
            return;
        }

        setIsLoading(true);
        try {
            // Create Firebase Auth account
            const credential = await registerWithEmail(
                formData.email,
                formData.password,
                formData.fullName
            );

            // Create employee profile in Firestore
            if (credential.user) {
                await setDocument(COLLECTIONS.EMPLOYEES, credential.user.uid, {
                    name: formData.fullName,
                    email: formData.email,
                    phone_number: formData.phone || null,
                    role: formData.role,
                    department: formData.department || null,
                    status: 'ACTIVE',
                    availability: 'AVAILABLE',
                    avatar_url: credential.user.photoURL || '',
                    created_at: serverTimestamp(),
                    last_active: serverTimestamp(),
                });
            }

            await refreshEmployee();
            router.push('/dashboard');
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            setError(getAuthErrorMessage(firebaseError.code || ''));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Google completion form submit
    const handleGoogleCompleteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.fullName) {
            setError('Please enter your full name.');
            return;
        }
        if (!formData.phone) {
            setError('Please enter your phone / WhatsApp number.');
            return;
        }
        if (!formData.department) {
            setError('Please select a department.');
            return;
        }
        if (!formData.role) {
            setError('Please select a role.');
            return;
        }
        if (!acceptTerms) {
            setError('Please accept the Terms of Service and Privacy Policy.');
            return;
        }

        setIsLoading(true);
        try {
            if (!user) throw new Error('User not found');

            await setDocument(COLLECTIONS.EMPLOYEES, user.uid, {
                name: formData.fullName,
                email: user.email || '',
                phone_number: formData.phone,
                role: formData.role,
                department: formData.department,
                status: 'ACTIVE',
                availability: 'AVAILABLE',
                avatar_url: user.photoURL || '',
                created_at: serverTimestamp(),
                last_active: serverTimestamp(),
            });

            await refreshEmployee();
            router.push('/dashboard');
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            setError(getAuthErrorMessage(firebaseError.code || 'unknown'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        setIsLoading(true);
        try {
            const credential = await loginWithGoogle();
            // Check if user already has a profile
            const existingProfile = await getDocument(COLLECTIONS.EMPLOYEES, credential.user.uid);
            if (existingProfile) {
                // Returning user — go to dashboard
                await refreshEmployee();
                router.push('/dashboard');
            } else {
                // First-time Google user — show completion form
                setGoogleCompleteMode(true);
                setFormData((prev) => ({
                    ...prev,
                    fullName: credential.user.displayName || '',
                    email: credential.user.email || '',
                }));
            }
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            setError(getAuthErrorMessage(firebaseError.code || ''));
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
        if (!pwd) return { label: '', color: '', width: 'w-0' };
        if (pwd.length < 6) return { label: 'Weak', color: 'bg-accent-red', width: 'w-1/4' };
        if (pwd.length < 8) return { label: 'Fair', color: 'bg-accent-orange', width: 'w-2/4' };
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd)) return { label: 'Strong', color: 'bg-accent-green', width: 'w-full' };
        return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
    };

    const strength = getPasswordStrength(formData.password);

    // Don't render the form if already authenticated with a complete profile
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

    // ─── Google Completion Form ──────────────────────────────────────
    if (googleCompleteMode) {
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

                {/* Right: Google Completion Form */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                    <div className="w-full max-w-[480px] flex flex-col gap-6 animate-fade-in">

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

                        {/* Google account badge */}
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-blue-100 overflow-hidden flex-shrink-0">
                                {user?.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt="Profile"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-blue-500 text-[22px]">account_circle</span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-text-primary truncate">{user?.displayName || 'Google User'}</span>
                                <span className="text-xs text-text-secondary truncate">{user?.email}</span>
                            </div>
                            <span className="ml-auto flex-shrink-0">
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </span>
                        </div>

                        {/* Header */}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-text-primary mb-2">Complete Registration</h2>
                            <p className="text-text-secondary">Almost there! Fill in the remaining details to get started.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-accent-red/5 border border-accent-red/20 rounded-lg text-accent-red text-sm animate-fade-in">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Google Completion Form */}
                        <form className="flex flex-col gap-5 animate-fade-in" onSubmit={handleGoogleCompleteSubmit}>
                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="gc-name">
                                    Full Name <span className="text-accent-red">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">person</span>
                                    </div>
                                    <input
                                        id="gc-name"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => update('fullName', e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                        placeholder="Ahmed Al-Mansoori"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            {/* Phone / WhatsApp Number */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="gc-phone">
                                    Phone / WhatsApp Number <span className="text-accent-red">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">phone</span>
                                    </div>
                                    <input
                                        id="gc-phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => update('phone', e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                        placeholder="+973 XXXX XXXX"
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="gc-department">
                                    Department <span className="text-accent-red">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">business</span>
                                    </div>
                                    <select
                                        id="gc-department"
                                        value={formData.department}
                                        onChange={(e) => update('department', e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select department...</option>
                                        <option value="News">News</option>
                                        <option value="Business">Business</option>
                                        <option value="Politics">Politics</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Arts">Arts & Culture</option>
                                    </select>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary">
                                    Select your role <span className="text-accent-red">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {roleOptions.map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => update('role', role.value)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${formData.role === role.value
                                                ? 'border-primary bg-primary-light text-primary shadow-sm'
                                                : 'border-gray-200 text-text-secondary hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[24px]">{role.icon}</span>
                                            <span className="text-xs font-bold">{role.label}</span>
                                            <span className="text-[10px] leading-tight opacity-70">{role.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Terms */}
                            <label className="flex items-start gap-2 cursor-pointer select-none group" htmlFor="gc-accept-terms">
                                <input
                                    id="gc-accept-terms"
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="h-4 w-4 mt-0.5 text-primary focus:ring-primary/20 border-gray-300 rounded cursor-pointer"
                                />
                                <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                                    I agree to the{' '}
                                    <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                                </span>
                            </label>

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
                                        <span>Completing registration...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span>Complete Registration</span>
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <p className="text-center text-sm text-text-secondary">
                            Already have an account?{' '}
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

    // ─── Normal Registration Form ───────────────────────────────────
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

            {/* Right: Registration Form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="w-full max-w-[480px] flex flex-col gap-6 animate-fade-in">

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

                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-text-primary mb-2">Create Account</h2>
                        <p className="text-text-secondary">Join Al-Ayyam AI Platform to start managing news tasks.</p>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                            <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                }`}>1</div>
                            <span className={`text-xs font-medium ${step >= 1 ? 'text-primary' : 'text-text-secondary'}`}>
                                Personal Info
                            </span>
                        </div>
                        <div className={`flex-1 h-0.5 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                        <div className="flex items-center gap-2 flex-1 justify-end">
                            <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                }`}>2</div>
                            <span className={`text-xs font-medium ${step >= 2 ? 'text-primary' : 'text-text-secondary'}`}>
                                Role & Security
                            </span>
                        </div>
                    </div>

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 w-full h-12 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-text-primary font-medium shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Register with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-200" />
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with email</span>
                        <div className="flex-grow border-t border-gray-200" />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-accent-red/5 border border-accent-red/20 rounded-lg text-accent-red text-sm animate-fade-in">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <form className="flex flex-col gap-5 animate-fade-in" onSubmit={handleStep1Next}>
                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="reg-name">
                                    Full Name <span className="text-accent-red">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">person</span>
                                    </div>
                                    <input
                                        id="reg-name"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => update('fullName', e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                        placeholder="Ahmed Al-Mansoori"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="reg-email">
                                    Email address <span className="text-accent-red">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                    </div>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => update('email', e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                        placeholder="name@alayyam.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="reg-phone">
                                    Phone / WhatsApp Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">phone</span>
                                    </div>
                                    <input
                                        id="reg-phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => update('phone', e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                        placeholder="+973 XXXX XXXX"
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="reg-department">
                                    Department
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">business</span>
                                    </div>
                                    <select
                                        id="reg-department"
                                        value={formData.department}
                                        onChange={(e) => update('department', e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select department...</option>
                                        <option value="News">News</option>
                                        <option value="Business">Business</option>
                                        <option value="Politics">Politics</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Arts">Arts & Culture</option>
                                    </select>
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 mt-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                <span>Continue</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </form>
                    )}

                    {/* Step 2: Role & Security */}
                    {step === 2 && (
                        <form className="flex flex-col gap-5 animate-fade-in" onSubmit={handleSubmit}>
                            {/* Role Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary">
                                    Select your role <span className="text-accent-red">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {roleOptions.map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => update('role', role.value)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${formData.role === role.value
                                                ? 'border-primary bg-primary-light text-primary shadow-sm'
                                                : 'border-gray-200 text-text-secondary hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[24px]">{role.icon}</span>
                                            <span className="text-xs font-bold">{role.label}</span>
                                            <span className="text-[10px] leading-tight opacity-70">{role.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="reg-password">
                                    Password <span className="text-accent-red">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                                    </div>
                                    <input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => update('password', e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
                                        placeholder="Minimum 8 characters"
                                        autoComplete="new-password"
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
                                {/* Password Strength */}
                                {formData.password && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                                        </div>
                                        <span className={`text-xs font-medium ${strength.label === 'Weak' ? 'text-accent-red' :
                                            strength.label === 'Fair' ? 'text-accent-orange' :
                                                strength.label === 'Good' ? 'text-blue-500' : 'text-accent-green'
                                            }`}>
                                            {strength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary" htmlFor="reg-confirm-password">
                                    Confirm Password <span className="text-accent-red">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                                    </div>
                                    <input
                                        id="reg-confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => update('confirmPassword', e.target.value)}
                                        className={`block w-full pl-10 pr-10 py-3 rounded-lg border bg-[#f6f6f8] text-text-primary placeholder-gray-400 focus:ring-2 focus:bg-white transition-all text-sm outline-none ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20'
                                            : formData.confirmPassword && formData.password === formData.confirmPassword
                                                ? 'border-accent-green focus:border-accent-green focus:ring-accent-green/20'
                                                : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                                            }`}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-xs text-accent-red flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                        Passwords do not match
                                    </p>
                                )}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <p className="text-xs text-accent-green flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                        Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Terms */}
                            <label className="flex items-start gap-2 cursor-pointer select-none group" htmlFor="accept-terms">
                                <input
                                    id="accept-terms"
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="h-4 w-4 mt-0.5 text-primary focus:ring-primary/20 border-gray-300 rounded cursor-pointer"
                                />
                                <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                                    I agree to the{' '}
                                    <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                                </span>
                            </label>

                            {/* Actions */}
                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center justify-center gap-1 px-5 py-3 rounded-lg text-sm font-medium text-text-secondary bg-surface hover:bg-border transition-all border border-border"
                                >
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center py-3.5 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Login Link */}
                    <p className="text-center text-sm text-text-secondary">
                        Already have an account?{' '}
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

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        }>
            <RegisterPageContent />
        </Suspense>
    );
}
