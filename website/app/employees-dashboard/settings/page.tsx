'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUpdateEmployee } from '@/hooks/useEmployees';
import { SparklesText } from '@/components/ui/sparkles-text';
import { MagicCard } from '@/components/ui/magic-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';

type SettingsSection = 'profile' | 'account' | 'notifications' | 'appearance';

interface ToastMessage {
    type: 'success' | 'error';
    message: string;
}

export default function EmployeeSettingsPage() {
    const { employee, user } = useAuth();
    const updateEmployee = useUpdateEmployee();

    // Active section state
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

    // Form state
    const [formData, setFormData] = useState({
        // Profile
        name: '',
        avatar_url: '',
        // Account
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        taskAssigned: true,
        taskUpdated: true,
        deadlineReminder: true,
        // Appearance
        theme: 'system' as 'light' | 'dark' | 'system',
    });

    // Loading and feedback states
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form data from employee/user
    useEffect(() => {
        if (employee) {
            setFormData(prev => ({
                ...prev,
                name: employee.name || '',
                avatar_url: employee.avatar_url || '',
                email: employee.email || user?.email || '',
            }));
        }
    }, [employee, user]);

    // Show toast notification
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Validate email format
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate password strength
    const isValidPassword = (password: string) => {
        return password.length >= 8;
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Validate form before submission
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (activeSection === 'profile') {
            if (!formData.name.trim()) {
                newErrors.name = 'Name is required';
            }
        }

        if (activeSection === 'account') {
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!isValidEmail(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }

            if (formData.newPassword) {
                if (!formData.currentPassword) {
                    newErrors.currentPassword = 'Current password is required';
                } else if (!isValidPassword(formData.newPassword)) {
                    newErrors.newPassword = 'Password must be at least 8 characters';
                } else if (formData.newPassword !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        if (!validateForm()) {
            showToast('error', 'Please fix the errors before saving');
            return;
        }

        if (!employee) return;

        setIsSaving(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update employee data
            if (activeSection === 'profile') {
                await updateEmployee.mutateAsync({
                    id: employee.id,
                    data: {
                        name: formData.name,
                        avatar_url: formData.avatar_url,
                    }
                });
            }

            // In a real app, you would also update:
            // - Account settings (email, password) via auth API
            // - Notification preferences via user preferences API
            // - Appearance settings via localStorage or user preferences API

            showToast('success', 'Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            showToast('error', 'Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Navigation items for settings sidebar
    const navItems = [
        { id: 'profile' as SettingsSection, icon: 'person', label: 'Profile' },
        { id: 'account' as SettingsSection, icon: 'account_circle', label: 'Account' },
        { id: 'notifications' as SettingsSection, icon: 'notifications', label: 'Notifications' },
        { id: 'appearance' as SettingsSection, icon: 'palette', label: 'Appearance' },
    ];

    if (!employee) {
        return (
            <div className="p-6">
                <div className="max-w-5xl mx-auto text-center py-12">
                    <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4 block">settings</span>
                    <p className="text-text-secondary">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <SparklesText className="text-3xl" colors={{ first: '#3b82f6', second: '#8b5cf6' }} sparklesCount={8}>
                        Settings
                    </SparklesText>
                    <p className="text-text-secondary mt-2">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div
                        className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in-right ${
                            toast.type === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">
                                {toast.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            {toast.message}
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 shrink-0">
                        <MagicCard
                            className="p-4 shadow-xl bg-card"
                            gradientFrom="#6366f1"
                            gradientTo="#8b5cf6"
                            gradientColor="#1e1b4b"
                            gradientOpacity={0.3}
                        >
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                                            activeSection === item.id
                                                ? 'bg-primary text-primary-foreground font-medium shadow-md'
                                                : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </MagicCard>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1">
                        <MagicCard
                            className="p-6 shadow-xl bg-card"
                            gradientFrom="#3b82f6"
                            gradientTo="#8b5cf6"
                            gradientColor="#1e1b4b"
                            gradientOpacity={0.4}
                        >
                            {/* Profile Section */}
                            {activeSection === 'profile' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <span className="material-symbols-outlined text-[28px] text-primary">person</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">Profile Settings</h2>
                                            <p className="text-sm text-text-secondary">Update your personal information</p>
                                        </div>
                                    </div>

                                    {/* Avatar Preview */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative size-24 shrink-0">
                                            {formData.avatar_url ? (
                                                <img
                                                    src={formData.avatar_url}
                                                    alt="Avatar"
                                                    className="size-24 rounded-full object-cover border-4 border-border"
                                                />
                                            ) : (
                                                <div className="size-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-border">
                                                    {formData.name.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                Avatar URL
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.avatar_url}
                                                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                                placeholder="https://example.com/photo.jpg"
                                            />
                                            <p className="text-[11px] text-text-secondary mt-1">
                                                Enter a URL for your profile picture
                                            </p>
                                        </div>
                                    </div>

                                    {/* Name Field */}
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                                                errors.name
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                    : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            } outline-none bg-card`}
                                            placeholder="Your full name"
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Read-only Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                Email
                                            </label>
                                            <div className="px-4 py-3 bg-surface border border-border rounded-lg text-text-primary text-sm font-medium">
                                                {formData.email}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                Role
                                            </label>
                                            <div className="px-4 py-3 bg-surface border border-border rounded-lg text-text-primary text-sm font-medium">
                                                {employee.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Section */}
                            {activeSection === 'account' && (
                                <div className="space-y-6 animate-fade-in">
                                        <span className="material-symbols-outlined text-[28px] text-primary">account_circle</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">Account Settings</h2>
                                            <p className="text-sm text-text-secondary">Manage your email and password</p>
                                        </div>
                                    

                                  
                                    {/* Password Section */}
                                    <div className="pt-4 border-t border-border">
                                        <h3 className="text-sm font-bold text-text-primary mb-4">Change Password</h3>

                                        {/* Current Password */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.currentPassword}
                                                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                                                        errors.currentPassword
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                    } outline-none bg-card`}
                                                    placeholder="Enter current password"
                                                />
                                                {errors.currentPassword && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
                                                )}
                                            </div>

                                            {/* New Password */}
                                            <div>
                                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.newPassword}
                                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                                                        errors.newPassword
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                    } outline-none bg-card`}
                                                    placeholder="Enter new password (min 8 characters)"
                                                />
                                                {errors.newPassword && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                                                )}
                                            </div>

                                            {/* Confirm Password */}
                                            <div>
                                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                                                        errors.confirmPassword
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                    } outline-none bg-card`}
                                                    placeholder="Confirm new password"
                                                />
                                                {errors.confirmPassword && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {activeSection === 'notifications' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <span className="material-symbols-outlined text-[28px] text-primary">notifications</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">Notification Preferences</h2>
                                            <p className="text-sm text-text-secondary">Choose how you want to be notified</p>
                                        </div>
                                    </div>

                                    {/* Email Notifications */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-text-primary">Email Notifications</h3>

                                        <div className="space-y-3">
                                            <ToggleSwitch
                                                label="Email Notifications"
                                                description="Receive notifications via email"
                                                checked={formData.emailNotifications}
                                                onChange={(checked) => handleInputChange('emailNotifications', checked)}
                                            />
                                            <ToggleSwitch
                                                label="Task Assigned"
                                                description="Get notified when a task is assigned to you"
                                                checked={formData.taskAssigned}
                                                onChange={(checked) => handleInputChange('taskAssigned', checked)}
                                            />
                                            <ToggleSwitch
                                                label="Task Updated"
                                                description="Get notified when your tasks are updated"
                                                checked={formData.taskUpdated}
                                                onChange={(checked) => handleInputChange('taskUpdated', checked)}
                                            />
                                            <ToggleSwitch
                                                label="Deadline Reminder"
                                                description="Get reminded before task deadlines"
                                                checked={formData.deadlineReminder}
                                                onChange={(checked) => handleInputChange('deadlineReminder', checked)}
                                            />
                                        </div>
                                    </div>

                                    {/* SMS Notifications */}
                                    <div className="pt-4 border-t border-border space-y-4">
                                        <h3 className="text-sm font-bold text-text-primary">SMS Notifications</h3>

                                        <div className="space-y-3">
                                            <ToggleSwitch
                                                label="SMS Notifications"
                                                description="Receive notifications via SMS"
                                                checked={formData.smsNotifications}
                                                onChange={(checked) => handleInputChange('smsNotifications', checked)}
                                            />
                                            {formData.smsNotifications && (
                                                <p className="text-xs text-text-secondary pl-1">
                                                    SMS notifications will be sent to your registered phone number
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Section */}
                            {activeSection === 'appearance' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <span className="material-symbols-outlined text-[28px] text-primary">palette</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">Appearance</h2>
                                            <p className="text-sm text-text-secondary">Customize your dashboard appearance</p>
                                        </div>
                                    </div>

                                    {/* Theme Selection */}
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                            Theme Preference
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <ThemeOption
                                                icon="light_mode"
                                                label="Light"
                                                description="Clean and bright"
                                                selected={formData.theme === 'light'}
                                                onClick={() => handleInputChange('theme', 'light')}
                                            />
                                            <ThemeOption
                                                icon="dark_mode"
                                                label="Dark"
                                                description="Easy on the eyes"
                                                selected={formData.theme === 'dark'}
                                                onClick={() => handleInputChange('theme', 'dark')}
                                            />
                                            <ThemeOption
                                                icon="contrast"
                                                label="System"
                                                description="Follow your system"
                                                selected={formData.theme === 'system'}
                                                onClick={() => handleInputChange('theme', 'system')}
                                            />
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-xs text-text-secondary mb-3">
                                            Preview of your selected theme will be applied to the entire dashboard.
                                        </p>
                                        <div className="p-4 bg-surface rounded-lg border border-border">
                                            <p className="text-sm text-text-secondary">
                                                Theme changes are saved automatically and will persist across sessions.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="flex justify-end pt-6 border-t border-border">
                                <ShimmerButton
                                    onClick={handleSaveChanges}
                                    disabled={isSaving}
                                    background="rgba(59, 130, 246, 1)"
                                    shimmerColor="#3b82f6"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">save</span>
                                            Save Changes
                                        </span>
                                    )}
                                </ShimmerButton>
                            </div>
                        </MagicCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Toggle Switch Component
function ToggleSwitch({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start gap-4">
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                    checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        checked ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
            </button>
            <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary">{description}</p>
            </div>
        </div>
    );
}

// Theme Option Component
function ThemeOption({
    icon,
    label,
    description,
    selected,
    onClick,
}: {
    icon: string;
    label: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-surface'
            }`}
        >
            {selected && (
                <div className="absolute top-2 right-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
                </div>
            )}
            <div className="flex flex-col items-center text-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-text-primary">{icon}</span>
                <div>
                    <p className="text-sm font-semibold text-text-primary">{label}</p>
                                            <p className="text-xs text-text-secondary">{description}</p>
                                        </div>
                                    </div>
                                </button>
    );
}
