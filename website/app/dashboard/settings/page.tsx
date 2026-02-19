'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { SparklesText } from '@/components/ui/sparkles-text';
import { MagicCard } from '@/components/ui/magic-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import Avatar from '@/components/ui/Avatar';
import WhatsAppIntegrationSettings from './components/WhatsAppIntegrationSettings';

type AdminSettingsSection = 'system' | 'security' | 'users' | 'integrations' | 'billing';

interface ToastMessage {
    type: 'success' | 'error' | 'warning';
    message: string;
}

interface APIKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed: string;
    scopes: string[];
}

interface IntegrationKeys {
    whatsappNumber: string;
    whatsappApiKey: string;
    deepSeekApiKey: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Editor' | 'Reporter';
    status: 'Active' | 'Inactive' | 'Pending';
    lastActive: string;
}


interface BillingInfo {
    plan: 'Free' | 'Pro' | 'Enterprise';
    users: number;
    storage: number;
    nextBilling: string;
}

export default function AdminSettingsPage() {
    const { employee } = useAuth();

    // Active section state
    const [activeSection, setActiveSection] = useState<AdminSettingsSection>('system');

    // Form state
    const [formData, setFormData] = useState({
        // System Configuration
        platformName: 'Al-Ayam News Platform',
        timezone: 'Asia/Bahrain',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
        maintenanceMode: false,
        debugMode: false,
        // Security
        twoFactorAuth: true,
        sessionTimeout: 30,
        passwordPolicy: 'strong',
        ipWhitelist: '',
        // Feature Flags
        enableWhatsApp: true,
        enableAI: true,
        enableAnalytics: true,
        enableNotifications: true,
    });

    // Integration Keys
    const [integrationKeys, setIntegrationKeys] = useState<IntegrationKeys>({
        whatsappNumber: '+973 1234 5678',
        whatsappApiKey: 'sk_live_whatsapp_51Mz...xK2',
        deepSeekApiKey: 'sk_live_deepseek_51Mz...xK2',
    });

    const [showKeys, setShowKeys] = useState({
        whatsappApiKey: false,
        deepSeekApiKey: false,
    });

    // Users
    const [users, setUsers] = useState<User[]>([
        { id: '1', name: 'Ahmed Al-Mansoori', email: 'ahmed@alayam.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
        { id: '2', name: 'Fatima Hassan', email: 'fatima@alayam.com', role: 'Manager', status: 'Active', lastActive: '5 hours ago' },
        { id: '3', name: 'Mohamed Ali', email: 'mohamed@alayam.com', role: 'Editor', status: 'Active', lastActive: '1 day ago' },
        { id: '4', name: 'Sara Ahmed', email: 'sara@alayam.com', role: 'Reporter', status: 'Inactive', lastActive: '3 days ago' },
        { id: '5', name: 'Khalid Ibrahim', email: 'khalid@alayam.com', role: 'Editor', status: 'Pending', lastActive: 'Never' },
    ]);


    // Billing
    const [billing, setBilling] = useState<BillingInfo>({
        plan: 'Enterprise',
        users: 25,
        storage: 450,
        nextBilling: '2024-03-01',
    });

    // Loading and feedback states
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [showModal, setShowModal] = useState<{ type: string; data?: any } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal refs
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowModal(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef]);

    // Show toast notification
    const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast('success', 'Settings saved successfully!');
        } catch (error) {
            showToast('error', 'Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle integration key changes
    const handleIntegrationKeyChange = (field: keyof IntegrationKeys, value: string) => {
        setIntegrationKeys(prev => ({ ...prev, [field]: value }));
    };

    // Generate new WhatsApp API key
    const generateWhatsAppApiKey = () => {
        const newKey = `sk_whatsapp_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        setIntegrationKeys(prev => ({ ...prev, whatsappApiKey: newKey }));
        showToast('success', 'New WhatsApp API key generated successfully!');
    };

    // Generate new DeepSeek API key
    const generateDeepSeekApiKey = () => {
        const newKey = `sk_deepseek_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        setIntegrationKeys(prev => ({ ...prev, deepSeekApiKey: newKey }));
        showToast('success', 'New DeepSeek API key generated successfully!');
    };

    // Toggle key visibility
    const toggleKeyVisibility = (key: 'whatsappApiKey' | 'deepSeekApiKey') => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Toggle user status
    const toggleUserStatus = (id: string) => {
        setUsers(users.map(u => 
            u.id === id 
                ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' as any }
                : u
        ));
        showToast('success', 'User status updated!');
    };

    // Change user role
    const changeUserRole = (id: string, newRole: string) => {
        setUsers(users.map(u => 
            u.id === id ? { ...u, role: newRole as any } : u
        ));
        showToast('success', 'User role updated!');
    };

    // Delete user
    const deleteUser = (id: string) => {
        setShowModal({ type: 'deleteUser', data: id });
    };

    // Confirm delete user
    const confirmDeleteUser = () => {
        if (showModal?.type === 'deleteUser') {
            setUsers(users.filter(u => u.id !== showModal.data));
            setShowModal(null);
            showToast('success', 'User deleted successfully!');
        }
    };


    // Navigation items
    const navItems = [
        { id: 'system' as AdminSettingsSection, icon: 'settings', label: 'System' },
        { id: 'security' as AdminSettingsSection, icon: 'security', label: 'Security' },
        { id: 'users' as AdminSettingsSection, icon: 'group', label: 'Users & Roles' },
        { id: 'integrations' as AdminSettingsSection, icon: 'hub', label: 'Integrations' },
        { id: 'billing' as AdminSettingsSection, icon: 'payments', label: 'Billing' },
    ];

    // Filter users based on search
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!employee) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto text-center py-12">
                    <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4 block">settings</span>
                    <p className="text-text-secondary">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <SparklesText className="text-3xl" colors={{ first: '#3b82f6', second: '#8b5cf6' }} sparklesCount={8}>
                        Platform Settings
                    </SparklesText>
                    <p className="text-text-secondary mt-2">
                        Manage system configuration, security, users, and integrations
                    </p>
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div
                        className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in-right ${
                            toast.type === 'success'
                                ? 'bg-green-500 text-white'
                                : toast.type === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-yellow-500 text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">
                                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'warning'}
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
                            {/* System Configuration Section */}
                            {activeSection === 'system' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <span className="material-symbols-outlined text-[28px] text-primary">settings</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">System Configuration</h2>
                                            <p className="text-sm text-text-secondary">Configure platform-wide settings</p>
                                        </div>
                                    </div>

                                    {/* Platform Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                            Platform Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.platformName}
                                            onChange={(e) => handleInputChange('platformName', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                            placeholder="Your platform name"
                                        />
                                    </div>

                                    {/* Timezone & Date Format */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                Timezone
                                            </label>
                                            <select
                                                value={formData.timezone}
                                                onChange={(e) => handleInputChange('timezone', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                            >
                                                <option value="Asia/Bahrain">Asia/Bahrain (GMT+3)</option>
                                                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                                                <option value="UTC">UTC (GMT+0)</option>
                                                <option value="America/New_York">America/New_York (GMT-5)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                Date Format
                                            </label>
                                            <select
                                                value={formData.dateFormat}
                                                onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                            Default Language
                                        </label>
                                        <select
                                            value={formData.language}
                                            onChange={(e) => handleInputChange('language', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                        >
                                            <option value="en">English</option>
                                            <option value="ar">Arabic</option>
                                        </select>
                                    </div>

                                    {/* Feature Flags */}
                                    <div className="pt-4 border-t border-border">
                                        <h3 className="text-sm font-bold text-text-primary mb-4">Feature Flags</h3>
                                        <div className="space-y-4">
                                            <ToggleSwitch
                                                label="WhatsApp Integration"
                                                description="Enable WhatsApp API for task notifications"
                                                checked={formData.enableWhatsApp}
                                                onChange={(checked) => handleInputChange('enableWhatsApp', checked)}
                                            />
                                            <ToggleSwitch
                                                label="AI Features"
                                                description="Enable AI-powered task suggestions and analytics"
                                                checked={formData.enableAI}
                                                onChange={(checked) => handleInputChange('enableAI', checked)}
                                            />
                                            <ToggleSwitch
                                                label="Analytics Dashboard"
                                                description="Enable advanced analytics and reporting"
                                                checked={formData.enableAnalytics}
                                                onChange={(checked) => handleInputChange('enableAnalytics', checked)}
                                            />
                                            <ToggleSwitch
                                                label="Push Notifications"
                                                description="Enable browser push notifications"
                                                checked={formData.enableNotifications}
                                                onChange={(checked) => handleInputChange('enableNotifications', checked)}
                                            />
                                        </div>
                                    </div>

                                    {/* System Modes */}
                                    <div className="pt-4 border-t border-border">
                                        <h3 className="text-sm font-bold text-text-primary mb-4">System Modes</h3>
                                        <div className="space-y-4">
                                            <ToggleSwitch
                                                label="Maintenance Mode"
                                                description="Temporarily disable platform access for all users"
                                                checked={formData.maintenanceMode}
                                                onChange={(checked) => {
                                                    if (checked) {
                                                        setShowModal({ type: 'maintenanceMode' });
                                                    } else {
                                                        handleInputChange('maintenanceMode', checked);
                                                    }
                                                }}
                                                warning={formData.maintenanceMode}
                                            />
                                            <ToggleSwitch
                                                label="Debug Mode"
                                                description="Enable detailed logging for troubleshooting"
                                                checked={formData.debugMode}
                                                onChange={(checked) => handleInputChange('debugMode', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Section */}
                            {activeSection === 'security' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <span className="material-symbols-outlined text-[28px] text-primary">security</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">Security & Access Control</h2>
                                            <p className="text-sm text-text-secondary">Manage authentication and API access</p>
                                        </div>
                                    </div>

                                    {/* Security Settings */}
                                    <div className="space-y-4">
                                        <ToggleSwitch
                                            label="Two-Factor Authentication"
                                            description="Require 2FA for all admin accounts"
                                            checked={formData.twoFactorAuth}
                                            onChange={(checked) => handleInputChange('twoFactorAuth', checked)}
                                        />
                                        
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                Session Timeout (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.sessionTimeout}
                                                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                                min="5"
                                                max="1440"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                Password Policy
                                            </label>
                                            <select
                                                value={formData.passwordPolicy}
                                                onChange={(e) => handleInputChange('passwordPolicy', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                            >
                                                <option value="weak">Weak (6+ characters)</option>
                                                <option value="medium">Medium (8+ characters, 1 number)</option>
                                                <option value="strong">Strong (8+ characters, 1 number, 1 special char)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                IP Whitelist (comma-separated)
                                            </label>
                                            <textarea
                                                value={formData.ipWhitelist}
                                                onChange={(e) => handleInputChange('ipWhitelist', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium resize-none"
                                                rows={3}
                                                placeholder="192.168.1.1, 10.0.0.1"
                                            />
                                            <p className="text-xs text-text-secondary mt-1">
                                                Leave empty to allow access from any IP address
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Users & Roles Section */}
                            {activeSection === 'users' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[28px] text-primary">group</span>
                                            <div>
                                                <h2 className="text-xl font-bold text-text-primary">Users & Roles</h2>
                                                <p className="text-sm text-text-secondary">Manage team members and permissions</p>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                                            Add User
                                        </button>
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search users by name or email..."
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium"
                                        />
                                    </div>

                                    {/* Users Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">User</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Active</th>
                                                    <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar src="" alt={user.name} size="sm" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-text-primary">{user.name}</p>
                                                                    <p className="text-xs text-text-secondary">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => changeUserRole(user.id, e.target.value)}
                                                                className="px-2 py-1 text-xs font-medium bg-surface border border-border rounded focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                            >
                                                                <option value="Admin">Admin</option>
                                                                <option value="Manager">Manager</option>
                                                                <option value="Editor">Editor</option>
                                                                <option value="Reporter">Reporter</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                user.status === 'Active' 
                                                                    ? 'bg-green-50 text-green-700' 
                                                                    : user.status === 'Inactive'
                                                                    ? 'bg-gray-100 text-gray-700'
                                                                    : 'bg-yellow-50 text-yellow-700'
                                                            }`}>
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-xs text-text-secondary">{user.lastActive}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => toggleUserStatus(user.id)}
                                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                                        user.status === 'Active'
                                                                            ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                                                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                                    }`}
                                                                    title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">
                                                                        {user.status === 'Active' ? 'block' : 'check_circle'}
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteUser(user.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete User"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between pt-4">
                                        <p className="text-sm text-text-secondary">
                                            Showing {filteredUsers.length} of {users.length} users
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50" disabled>
                                                Previous
                                            </button>
                                            <span className="px-3 py-1 text-sm font-medium bg-primary text-white rounded">1</span>
                                            <button className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50" disabled>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Integrations Section */}
                            {activeSection === 'integrations' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <span className="material-symbols-outlined text-[28px] text-primary">hub</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">Integration Settings</h2>
                                            <p className="text-sm text-text-secondary">Configure third-party webhooks and APIs</p>
                                        </div>
                                    </div>

                                    {/* WhatsApp Integration Settings */}
                                    <div className="p-4 bg-surface rounded-lg border border-border">
                                        <WhatsAppIntegrationSettings />
                                    </div>

                                    {/* DeepSeek AI Configuration */}
                                    <div className="p-4 bg-surface rounded-lg border border-border">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-purple-600 text-[24px]">psychology</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-text-primary">DeepSeek AI Model</p>
                                                <p className="text-xs text-text-secondary">Configure AI-powered features and analytics</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                                DeepSeek API Key
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showKeys.deepSeekApiKey ? 'text' : 'password'}
                                                    value={integrationKeys.deepSeekApiKey}
                                                    onChange={(e) => handleIntegrationKeyChange('deepSeekApiKey', e.target.value)}
                                                    className="w-full px-4 pr-24 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-medium font-mono"
                                                    placeholder="Enter your DeepSeek API key"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleKeyVisibility('deepSeekApiKey')}
                                                        className="p-1.5 text-text-secondary hover:text-text-primary rounded transition-colors"
                                                        title={showKeys.deepSeekApiKey ? 'Hide' : 'Show'}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {showKeys.deepSeekApiKey ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                   
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-secondary mt-2">
                                                This key is used for AI-powered task suggestions, analytics, and smart features.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Connected Services */}
                                    <div className="pt-4 border-t border-border">
                                        <h3 className="text-sm font-bold text-text-primary mb-4">Connected Services</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-green-600 text-[24px]">chat</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-text-primary">WhatsApp Business API</p>
                                                        <p className="text-xs text-text-secondary">Meta Cloud API Integration</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Available</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-blue-600 text-[24px]">cloud</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-text-primary">Firebase Cloud Storage</p>
                                                        <p className="text-xs text-text-secondary">Connected and active</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Connected</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Billing Section */}
                            {activeSection === 'billing' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <span className="material-symbols-outlined text-[28px] text-primary">payments</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">Billing Overview</h2>
                                            <p className="text-sm text-text-secondary">Manage subscription and usage</p>
                                        </div>
                                    </div>

                                  

                                    {/* Usage Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-surface rounded-lg border border-border">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-blue-600 text-[24px]">group</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-secondary">Active Users</p>
                                                    <p className="text-xl font-bold text-text-primary">{billing.users}</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: '83%' }}></div>
                                            </div>
                                            <p className="text-xs text-text-secondary mt-2">83% of 30 users included</p>
                                        </div>
                                        <div className="p-4 bg-surface rounded-lg border border-border">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-purple-600 text-[24px]">storage</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-secondary">Storage Used</p>
                                                    <p className="text-xl font-bold text-text-primary">{billing.storage} GB</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                            </div>
                                            <p className="text-xs text-text-secondary mt-2">45% of 1 TB included</p>
                                        </div>
                                    </div>

                                    {/* Billing Information */}
                                    <div className="p-4 bg-surface rounded-lg border border-border">
                                        <h3 className="text-sm font-bold text-text-primary mb-4">Billing Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-text-secondary">Next Billing Date</span>
                                                <span className="text-sm font-medium text-text-primary">{billing.nextBilling}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-text-secondary">Payment Method</span>
                                                <span className="text-sm font-medium text-text-primary">•••• •••• •••• 4242</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-text-secondary">Billing Email</span>
                                                <span className="text-sm font-medium text-text-primary">billing@alayam.com</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice History */}
                                    <div>
                                        <h3 className="text-sm font-bold text-text-primary mb-4">Invoice History</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Invoice</th>
                                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                                        <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-border hover:bg-surface/50 transition-colors">
                                                        <td className="py-3 px-4 text-sm font-medium text-text-primary">INV-2024-02</td>
                                                        <td className="py-3 px-4 text-sm text-text-secondary">Feb 1, 2024</td>
                                                        <td className="py-3 px-4 text-sm font-medium text-text-primary">$299.00</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Paid</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button className="text-sm text-primary hover:text-primary/80">Download</button>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b border-border hover:bg-surface/50 transition-colors">
                                                        <td className="py-3 px-4 text-sm font-medium text-text-primary">INV-2024-01</td>
                                                        <td className="py-3 px-4 text-sm text-text-secondary">Jan 1, 2024</td>
                                                        <td className="py-3 px-4 text-sm font-medium text-text-primary">$299.00</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Paid</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button className="text-sm text-primary hover:text-primary/80">Download</button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
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

                {/* Confirmation Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowModal(null)}
                        />
                        <div ref={modalRef} className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                            {showModal.type === 'deleteUser' && (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="size-12 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-red-600 text-[24px]">warning</span>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-text-primary text-lg">Delete User</h2>
                                            <p className="text-sm text-text-secondary">This action cannot be undone</p>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary mb-6">
                                        Are you sure you want to delete this user? All their data and permissions will be permanently removed.
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setShowModal(null)}
                                            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteUser}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            Delete User
                                        </button>
                                    </div>
                                </>
                            )}
                            {showModal.type === 'maintenanceMode' && (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="size-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-yellow-600 text-[24px]">warning</span>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-text-primary text-lg">Enable Maintenance Mode</h2>
                                            <p className="text-sm text-text-secondary">This will affect all users</p>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary mb-6">
                                        Are you sure you want to enable maintenance mode? All users will be unable to access the platform until it is disabled.
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setShowModal(null)}
                                            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleInputChange('maintenanceMode', true);
                                                setShowModal(null);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">build</span>
                                            Enable Maintenance
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
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
    warning,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    warning?: boolean;
}) {
    return (
        <div className="flex items-start gap-4">
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                    warning ? 'bg-yellow-500' : checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        checked ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
            </button>
            <div className="flex-1">
                <p className={`text-sm font-medium ${warning ? 'text-yellow-700' : 'text-text-primary'}`}>{label}</p>
                <p className="text-xs text-text-secondary">{description}</p>
            </div>
        </div>
    );
}
