'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWhatsAppSettings } from '@/hooks/useWhatsApp';
import { configureWhatsApp, isWhatsAppConfigured, sendTextMessage } from '@/lib/whatsapp/api';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────

interface WhatsAppIntegrationSettings {
    whatsappNumber: string;
    whatsappApiKey: string;
    whatsappPhoneNumberId: string;
    whatsappBusinessAccountId: string;
    whatsappWebhookSecret: string;
}

// ─── Connection Status Component ───────────────────────────────────

function ConnectionStatus({ status, message }: { status: 'connected' | 'disconnected' | 'testing' | null; message?: string }) {
    const statusConfig = {
        connected: {
            icon: 'check_circle',
            color: 'text-green-600',
            bg: 'bg-green-50',
            label: 'Connected',
        },
        disconnected: {
            icon: 'error',
            color: 'text-red-600',
            bg: 'bg-red-50',
            label: 'Disconnected',
        },
        testing: {
            icon: 'sync',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            label: 'Testing...',
        },
    };

    if (!status) return null;

    const config = statusConfig[status];

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}>
            <span className={`material-symbols-outlined text-[20px] ${config.color} ${status === 'testing' ? 'animate-spin' : ''}`}>
                {config.icon}
            </span>
            <div>
                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                {message && status === 'disconnected' && (
                    <p className="text-xs text-red-500 mt-0.5">{message}</p>
                )}
            </div>
        </div>
    );
}

// ─── Info Tooltip Component ────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative inline-block ml-1">
            <button
                type="button"
                className="text-text-secondary hover:text-text-primary transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <span className="material-symbols-outlined text-[16px]">info</span>
            </button>
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────

export default function WhatsAppIntegrationSettings() {
    const { settings, isLoading, saveSettings, isSaving } = useWhatsAppSettings();

    const [localSettings, setLocalSettings] = useState<WhatsAppIntegrationSettings>({
        whatsappNumber: '',
        whatsappApiKey: '',
        whatsappPhoneNumberId: '',
        whatsappBusinessAccountId: '',
        whatsappWebhookSecret: '',
    });

    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
        whatsappApiKey: false,
        whatsappWebhookSecret: false,
    });

    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing' | null>(null);
    const [connectionMessage, setConnectionMessage] = useState<string>('');
    const isInitializedRef = useRef(false);

    // Sync local state with fetched settings
    useEffect(() => {
        if (settings && !isLoading && !isInitializedRef.current) {
            setLocalSettings({
                whatsappNumber: settings.whatsappNumber || '',
                whatsappApiKey: settings.whatsappApiKey || '',
                whatsappPhoneNumberId: settings.whatsappPhoneNumberId || '',
                whatsappBusinessAccountId: settings.whatsappBusinessAccountId || '',
                whatsappWebhookSecret: settings.whatsappWebhookSecret || '',
            });
            isInitializedRef.current = true;
        }
    }, [settings, isLoading]);

    const handleInputChange = (field: keyof WhatsAppIntegrationSettings, value: string) => {
        setLocalSettings((prev) => ({ ...prev, [field]: value }));
        // Reset connection status when settings change
        setConnectionStatus(null);
    };

    const toggleKeyVisibility = (key: string) => {
        setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTestConnection = async () => {
        setConnectionStatus('testing');
        setConnectionMessage('');

        // Validate required fields
        if (!localSettings.whatsappApiKey || !localSettings.whatsappPhoneNumberId) {
            setConnectionStatus('disconnected');
            setConnectionMessage('Missing required fields: API Key and Phone Number ID');
            return;
        }

        // Configure WhatsApp with current settings
        configureWhatsApp({
            accessToken: localSettings.whatsappApiKey,
            phoneNumberId: localSettings.whatsappPhoneNumberId,
            businessAccountId: localSettings.whatsappBusinessAccountId || undefined,
            webhookVerifyToken: localSettings.whatsappWebhookSecret || undefined,
            apiVersion: 'v18.0',
        });

        if (!isWhatsAppConfigured()) {
            setConnectionStatus('disconnected');
            setConnectionMessage('Configuration failed. Check your API credentials.');
            return;
        }

        try {
            // Test by attempting to get account info (this validates the token)
            const response = await fetch(
                `https://graph.facebook.com/v18.0/${localSettings.whatsappPhoneNumberId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localSettings.whatsappApiKey}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('[WhatsApp] Connection test successful:', data);
                setConnectionStatus('connected');
                setConnectionMessage('');
                toast.success('WhatsApp connection successful!');
            } else {
                const errorData = await response.json();
                console.error('[WhatsApp] Connection test failed:', errorData);
                setConnectionStatus('disconnected');
                setConnectionMessage(errorData.error?.message || 'Connection failed. Check your credentials.');
                toast.error('WhatsApp connection failed');
            }
        } catch (error) {
            console.error('[WhatsApp] Connection test error:', error);
            setConnectionStatus('disconnected');
            setConnectionMessage('Network error. Please check your internet connection.');
            toast.error('Connection test failed');
        }
    };

    const handleSave = async () => {
        try {
            await saveSettings({
                whatsappNumber: localSettings.whatsappNumber,
                whatsappApiKey: localSettings.whatsappApiKey,
                whatsappPhoneNumberId: localSettings.whatsappPhoneNumberId,
                whatsappBusinessAccountId: localSettings.whatsappBusinessAccountId,
                whatsappWebhookSecret: localSettings.whatsappWebhookSecret,
            });

            // Re-configure WhatsApp after save
            if (localSettings.whatsappApiKey && localSettings.whatsappPhoneNumberId) {
                configureWhatsApp({
                    accessToken: localSettings.whatsappApiKey,
                    phoneNumberId: localSettings.whatsappPhoneNumberId,
                    businessAccountId: localSettings.whatsappBusinessAccountId || undefined,
                    webhookVerifyToken: localSettings.whatsappWebhookSecret || undefined,
                    apiVersion: 'v18.0',
                });
            }

            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 bg-surface rounded-lg border border-border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-[28px]">chat</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">WhatsApp Business API</h3>
                    <p className="text-sm text-text-secondary">Configure Meta Cloud API for task notifications</p>
                </div>
            </div>

            {/* Connection Status */}
            <ConnectionStatus status={connectionStatus} message={connectionMessage} />

            {/* Setup Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-[20px] mt-0.5">help</span>
                    <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">How to get your credentials:</p>
                        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Go to Meta for Developers: developers.facebook.com</li>
                            <li>Create a new app and add WhatsApp product</li>
                            <li>In WhatsApp &gt; API Setup, find your <strong>Phone Number ID</strong></li>
                            <li>Generate a <strong>Permanent Access Token</strong> (not temporary token)</li>
                            <li>Set up Webhook URL: <code className="bg-blue-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/whatsapp</code></li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* API Configuration */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-text-primary">API Configuration</h4>

                {/* API Access Token */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        API Access Token
                        <InfoTooltip text="Permanent access token from Meta for Developers. Do NOT use temporary tokens as they expire quickly." />
                    </label>
                    <div className="relative">
                        <input
                            type={showKeys.whatsappApiKey ? 'text' : 'password'}
                            value={localSettings.whatsappApiKey}
                            onChange={(e) => handleInputChange('whatsappApiKey', e.target.value)}
                            className="w-full px-4 pr-24 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-mono"
                            placeholder="EAAG... (starts with EAAG)"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => toggleKeyVisibility('whatsappApiKey')}
                                className="p-1.5 text-text-secondary hover:text-text-primary rounded transition-colors"
                                title={showKeys.whatsappApiKey ? 'Hide' : 'Show'}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showKeys.whatsappApiKey ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phone Number ID */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Phone Number ID
                        <InfoTooltip text="The Phone Number ID from your WhatsApp Business Account. Found in Meta Developer Dashboard under WhatsApp &gt; API Setup." />
                    </label>
                    <input
                        type="text"
                        value={localSettings.whatsappPhoneNumberId}
                        onChange={(e) => handleInputChange('whatsappPhoneNumberId', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-mono"
                        placeholder="123456789012345"
                    />
                </div>

                {/* Business Account ID (Optional) */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Business Account ID (WABA)
                        <span className="text-text-secondary font-normal normal-case ml-1">- Optional</span>
                    </label>
                    <input
                        type="text"
                        value={localSettings.whatsappBusinessAccountId}
                        onChange={(e) => handleInputChange('whatsappBusinessAccountId', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-mono"
                        placeholder="123456789012345"
                    />
                </div>
            </div>

            {/* Webhook Configuration */}
            <div className="pt-4 border-t border-border space-y-4">
                <h4 className="text-sm font-bold text-text-primary">Webhook Configuration</h4>

                {/* Webhook Verify Token */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Webhook Verify Token
                        <InfoTooltip text="A secret token you create. Use this same value when configuring the webhook in Meta Developer Dashboard." />
                    </label>
                    <div className="relative">
                        <input
                            type={showKeys.whatsappWebhookSecret ? 'text' : 'password'}
                            value={localSettings.whatsappWebhookSecret}
                            onChange={(e) => handleInputChange('whatsappWebhookSecret', e.target.value)}
                            className="w-full px-4 pr-24 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm font-mono"
                            placeholder="your_secret_verify_token"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => toggleKeyVisibility('whatsappWebhookSecret')}
                                className="p-1.5 text-text-secondary hover:text-text-primary rounded transition-colors"
                                title={showKeys.whatsappWebhookSecret ? 'Hide' : 'Show'}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showKeys.whatsappWebhookSecret ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                        This token is used to verify webhook requests from Meta
                    </p>
                </div>

                {/* Webhook URL Display */}
                <div className="p-3 bg-surface rounded-lg">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Your Webhook URL
                    </label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs font-mono bg-card px-3 py-2 rounded border border-border text-text-primary truncate">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/whatsapp
                        </code>
                        <button
                            onClick={() => {
                                const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/whatsapp`;
                                navigator.clipboard.writeText(url);
                                toast.success('Webhook URL copied to clipboard');
                            }}
                            className="p-2 text-text-secondary hover:text-primary transition-colors"
                            title="Copy URL"
                        >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Phone Number */}
            <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-text-primary mb-3">Display Information</h4>
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        WhatsApp Business Number
                        <InfoTooltip text="The phone number employees will see in WhatsApp messages." />
                    </label>
                    <input
                        type="tel"
                        value={localSettings.whatsappNumber}
                        onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-card text-sm"
                        placeholder="+973 1234 5678"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                <button
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'testing'}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className={`material-symbols-outlined text-[18px] ${connectionStatus === 'testing' ? 'animate-spin' : ''}`}>
                        {connectionStatus === 'testing' ? 'sync' : 'network_check'}
                    </span>
                    {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className={`material-symbols-outlined text-[18px] ${isSaving ? 'animate-spin' : ''}`}>
                        {isSaving ? 'sync' : 'save'}
                    </span>
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
