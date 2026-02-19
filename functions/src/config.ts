import * as functions from 'firebase-functions';

// ─── WhatsApp Configuration ─────────────────────────────────────────

export interface WhatsAppConfig {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    apiVersion: string;
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
    const config = functions.config();
    if (!config.whatsapp) {
        return null;
    }

    return {
        accessToken: config.whatsapp.access_token || '',
        phoneNumberId: config.whatsapp.phone_number_id || '',
        businessAccountId: config.whatsapp.business_account_id || '',
        webhookVerifyToken: config.whatsapp.webhook_verify_token || '',
        apiVersion: config.whatsapp.api_version || 'v18.0',
    };
}

// ─── DeepSeek AI Configuration ──────────────────────────────────────

export interface DeepSeekConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

export function getDeepSeekConfig(): DeepSeekConfig | null {
    const config = functions.config();
    if (!config.deepseek) {
        return null;
    }

    return {
        apiKey: config.deepseek.api_key || '',
        baseUrl: config.deepseek.base_url || 'https://api.deepseek.com',
        model: config.deepseek.model || 'deepseek-chat',
    };
}

// ─── Notification Configuration ─────────────────────────────────────

export interface NotificationConfig {
    emailFrom: string;
    smsProvider: string;
    smsApiKey: string;
}

export function getNotificationConfig(): NotificationConfig | null {
    const config = functions.config();
    if (!config.notifications) {
        return null;
    }

    return {
        emailFrom: config.notifications.email_from || '',
        smsProvider: config.notifications.sms_provider || 'twilio',
        smsApiKey: config.notifications.sms_api_key || '',
    };
}

// ─── Feature Flags ──────────────────────────────────────────────────

export interface FeatureFlags {
    enableWhatsApp: boolean;
    enableAI: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
}

export function getFeatureFlags(): FeatureFlags {
    const config = functions.config();
    const features = config.features || {};

    return {
        enableWhatsApp: features.enable_whatsapp !== 'false',
        enableAI: features.enable_ai !== 'false',
        enableNotifications: features.enable_notifications !== 'false',
        enableAnalytics: features.enable_analytics !== 'false',
    };
}

// ─── Escalation Settings ────────────────────────────────────────────

export interface EscalationSettings {
    firstReminderMinutes: number;
    secondReminderMinutes: number;
    escalationMinutes: number;
    autoReassignMinutes: number;
    deadlineWarningPercentages: number[];
}

export function getEscalationSettings(): EscalationSettings {
    const config = functions.config();
    const escalation = config.escalation || {};

    return {
        firstReminderMinutes: parseInt(escalation.first_reminder_minutes || '15', 10),
        secondReminderMinutes: parseInt(escalation.second_reminder_minutes || '30', 10),
        escalationMinutes: parseInt(escalation.escalation_minutes || '60', 10),
        autoReassignMinutes: parseInt(escalation.auto_reassign_minutes || '120', 10),
        deadlineWarningPercentages: [50, 25, 10],
    };
}
