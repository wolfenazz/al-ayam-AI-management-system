'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUpdateEmployee } from '@/hooks/useEmployees';
import { MagicCard } from '@/components/ui/magic-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { NumberTicker } from '@/components/ui/number-ticker';
import { SparklesText } from '@/components/ui/sparkles-text';

export default function EmployeeProfilePage() {
    const { employee, user } = useAuth();
    const updateEmployee = useUpdateEmployee();

    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        skills: '',
        avatar_url: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || '',
                phone_number: employee.phone_number || '',
                skills: employee.skills?.join(', ') || '',
                avatar_url: employee.avatar_url || '',
            });
        }
    }, [employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee) return;

        setMessage(null);

        try {
            await updateEmployee.mutateAsync({
                id: employee.id,
                data: {
                    phone_number: formData.phone_number,
                    skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                    avatar_url: formData.avatar_url,
                }
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        }
    };

    if (!employee) return <div className="p-8 text-center text-text-secondary">Loading profile...</div>;

    const performanceScore = employee.performance_score || 0;
    const isHighPerformance = performanceScore >= 80;
    const isMediumPerformance = performanceScore >= 50 && performanceScore < 80;

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <SparklesText className="text-3xl" colors={{ first: '#3b82f6', second: '#8b5cf6' }} sparklesCount={8}>
                        My Profile
                    </SparklesText>
                    <ShimmerButton
                        onClick={() => setIsEditing(!isEditing)}
                        background={isEditing ? 'rgba(0, 0, 0, 0.7)' : 'rgba(59, 130, 246, 1)'}
                        shimmerColor="#3b82f6"
                    >
                        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    </ShimmerButton>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="lg:col-span-1">
                        <MagicCard
                            className="p-6 shadow-xl bg-card"
                            gradientFrom="#3b82f6"
                            gradientTo="#8b5cf6"
                            gradientColor="#1e1b4b"
                            gradientOpacity={0.4}
                        >
                            <div className="text-center">
                                <div className="relative mx-auto size-36 mb-6">
                                    {employee.avatar_url ? (
                                        <img
                                            src={employee.avatar_url}
                                            alt={employee.name}
                                            className="size-36 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
                                        />
                                    ) : (
                                        <div className="size-36 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white dark:border-gray-800 shadow-2xl">
                                            {employee.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className={`absolute bottom-2 right-2 size-6 rounded-full border-2 border-white dark:border-gray-800 ${employee.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                                        }`} />
                                </div>

                                <h2 className="text-2xl font-bold text-text-primary mb-2">{employee.name}</h2>
                                <p className="text-base font-semibold text-primary mb-1">{employee.role}</p>
                                <p className="text-sm text-text-secondary">{employee.email}</p>

                                <div className="mt-8 pt-6 border-t border-border">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-text-secondary">Performance Score</span>
                                            <span className="font-bold text-text-primary flex items-center gap-2">
                                                <NumberTicker value={performanceScore} decimalPlaces={0} />
                                                <span className="text-lg">%</span>
                                            </span>
                                        </div>
                                        <div className="relative w-full max-w-[200px]">
                                            <AnimatedCircularProgressBar
                                                value={performanceScore}
                                                gaugePrimaryColor={isHighPerformance ? '#22c55e' : isMediumPerformance ? '#3b82f6' : '#f59e0b'}
                                                gaugeSecondaryColor="rgba(148, 163, 184, 0.3)"
                                                className="mx-auto"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MagicCard>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="lg:col-span-2">
                        <MagicCard
                            className="p-6 shadow-xl bg-card"
                            gradientFrom="#6366f1"
                            gradientTo="#8b5cf6"
                            gradientColor="#1e1b4b"
                            gradientOpacity={0.3}
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-xl font-bold text-text-primary">Personal Information</h3>

                                {/* Read-only fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                            Full Name
                                        </label>
                                        <div className="px-4 py-3 bg-surface border border-border rounded-lg text-text-primary text-sm font-medium">
                                            {employee.name}
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
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                            Email Address
                                        </label>
                                        <div className="px-4 py-3 bg-surface border border-border rounded-lg text-text-primary text-sm font-medium">
                                            {employee.email}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                            Department
                                        </label>
                                        <div className="px-4 py-3 bg-surface border border-border rounded-lg text-text-primary text-sm font-medium">
                                            {employee.department || 'General'}
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${isEditing
                                                ? 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card'
                                                : 'border-transparent bg-surface text-text-secondary'
                                            }`}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                        Skills (comma separated)
                                    </label>
                                    <textarea
                                        disabled={!isEditing}
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors resize-none ${isEditing
                                                ? 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card'
                                                : 'border-transparent bg-surface text-text-secondary'
                                            }`}
                                        rows={3}
                                        placeholder="Photography, Video Editing, Writing..."
                                    />
                                </div>

                                {isEditing && (
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                            Avatar URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.avatar_url}
                                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                        <p className="text-[11px] text-text-secondary mt-1">
                                            * In a production environment, this would be a file upload.
                                        </p>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                        <ShimmerButton
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            background="rgba(0, 0, 0, 0.5)"
                                            shimmerColor="#6b7280"
                                        >
                                            Cancel
                                        </ShimmerButton>
                                        <ShimmerButton
                                            type="submit"
                                            disabled={updateEmployee.isPending}
                                            background="rgba(59, 130, 246, 1)"
                                            shimmerColor="#3b82f6"
                                        >
                                            {updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
                                        </ShimmerButton>
                                    </div>
                                )}
                            </form>
                        </MagicCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
