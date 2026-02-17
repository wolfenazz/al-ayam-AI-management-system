'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUpdateEmployee } from '@/hooks/useEmployees';
import { useUIStore } from '@/stores/uiStore';

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
                    avatar_url: formData.avatar_url, // In a real app, this would be a file upload
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

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    </button>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl border border-border p-6 shadow-sm text-center">
                            <div className="relative mx-auto size-32 mb-4">
                                {employee.avatar_url ? (
                                    <img
                                        src={employee.avatar_url}
                                        alt={employee.name}
                                        className="size-32 rounded-full object-cover border-4 border-white shadow-md grayscale-0"
                                    />
                                ) : (
                                    <div className="size-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mx-auto border-4 border-white shadow-md">
                                        {employee.name.charAt(0)}
                                    </div>
                                )}
                                <div className={`absolute bottom-1 right-1 size-5 rounded-full border-2 border-white ${employee.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                                    }`} />
                            </div>

                            <h2 className="text-xl font-bold text-text-primary mb-1">{employee.name}</h2>
                            <p className="text-sm text-primary font-medium mb-1">{employee.role}</p>
                            <p className="text-xs text-text-secondary">{employee.email}</p>

                            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Performance</span>
                                    <span className="font-bold text-text-primary">{employee.performance_score || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full"
                                        style={{ width: `${employee.performance_score || 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-text-primary mb-6">Personal Information</h3>

                            <div className="space-y-6">
                                {/* Read-only fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                            Full Name
                                        </label>
                                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-text-primary text-sm">
                                            {employee.name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                            Role
                                        </label>
                                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-text-primary text-sm">
                                            {employee.role}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                            Email Address
                                        </label>
                                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-text-primary text-sm">
                                            {employee.email}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                            Department
                                        </label>
                                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-text-primary text-sm">
                                            {employee.department || 'General'}
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${isEditing
                                                ? 'border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white'
                                                : 'border-transparent bg-gray-50 text-text-secondary'
                                            }`}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                        Skills (comma separated)
                                    </label>
                                    <textarea
                                        disabled={!isEditing}
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors resize-none ${isEditing
                                                ? 'border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white'
                                                : 'border-transparent bg-gray-50 text-text-secondary'
                                            }`}
                                        rows={3}
                                        placeholder="Photography, Video Editing, Writing..."
                                    />
                                </div>

                                {isEditing && (
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                            Avatar URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.avatar_url}
                                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white text-sm"
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                        <p className="text-[10px] text-text-secondary mt-1">
                                            * In a production environment, this would be a file upload.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateEmployee.isPending}
                                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {updateEmployee.isPending && (
                                            <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
