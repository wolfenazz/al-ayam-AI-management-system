import type {
    WhatsAppOutboundMessage,
    WhatsAppWebhookPayload,
    IntegrationKeys,
} from '@/lib/validation/schemas';

// ─── Types ─────────────────────────────────────────────────────────

export interface WhatsAppMessageResponse {
    messaging_product: string;
    contacts: Array<{
        input: string;
        wa_id: string;
    }>;
    messages: Array<{
        id: string;
    }>;
}

export interface WhatsAppMediaResponse {
    id: string;
    url?: string;
    mime_type?: string;
    file_size?: number;
}

export interface WhatsAppError {
    message: string;
    type: string;
    code: number;
    error_data?: {
        details: string;
    };
}

export interface WhatsAppApiResponse<T> {
    success: boolean;
    data?: T;
    error?: WhatsAppError;
}

// ─── Configuration ─────────────────────────────────────────────────

interface WhatsAppConfig {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId?: string;
    webhookVerifyToken?: string;
    apiVersion?: string;
}

let config: WhatsAppConfig | null = null;

export function configureWhatsApp(input: WhatsAppConfig): void {
    config = input;
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
    return config;
}

export function isWhatsAppConfigured(): boolean {
    return !!(config?.accessToken && config?.phoneNumberId);
}

// ─── API Base URL ──────────────────────────────────────────────────

function getBaseUrl(): string {
    const version = config?.apiVersion || 'v18.0';
    return `https://graph.facebook.com/${version}`;
}

// ─── Send Message ──────────────────────────────────────────────────

export async function sendWhatsAppMessage(
    to: string,
    message: Omit<WhatsAppOutboundMessage, 'to'>
): Promise<WhatsAppApiResponse<WhatsAppMessageResponse>> {
    if (!isWhatsAppConfigured()) {
        return {
            success: false,
            error: {
                message: 'WhatsApp is not configured',
                type: 'configuration_error',
                code: 0,
            },
        };
    }

    const url = `${getBaseUrl()}/${config!.phoneNumberId}/messages`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config!.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to.replace(/[^0-9]/g, ''),
                ...message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || {
                    message: 'Failed to send message',
                    type: 'api_error',
                    code: response.status,
                },
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                type: 'network_error',
                code: 0,
            },
        };
    }
}

// ─── Send Text Message ─────────────────────────────────────────────

export async function sendTextMessage(
    to: string,
    text: string,
    previewUrl = false
): Promise<WhatsAppApiResponse<WhatsAppMessageResponse>> {
    return sendWhatsAppMessage(to, {
        type: 'text',
        text: {
            body: text,
            ...(previewUrl && { preview_url: true }),
        },
    });
}

// ─── Send Template Message ─────────────────────────────────────────

export async function sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode = 'en',
    components?: Array<{
        type: 'header' | 'body' | 'button';
        parameters: Array<{ type: string; text?: string }>;
    }>
): Promise<WhatsAppApiResponse<WhatsAppMessageResponse>> {
    return sendWhatsAppMessage(to, {
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: languageCode,
            },
            components,
        },
    });
}

// ─── Send Interactive Button Message ───────────────────────────────

export async function sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{
        id: string;
        title: string;
    }>
): Promise<WhatsAppApiResponse<WhatsAppMessageResponse>> {
    return sendWhatsAppMessage(to, {
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: bodyText,
            },
            action: {
                buttons: buttons.map((btn) => ({
                    type: 'reply',
                    reply: {
                        id: btn.id,
                        title: btn.title.substring(0, 20),
                    },
                })),
            },
        },
    });
}

// ─── Send Task Assignment Message ──────────────────────────────────

export interface TaskAssignmentMessage {
    taskTitle: string;
    description?: string;
    taskType: string;
    priority: string;
    deadline?: string;
    location?: string;
    deliverables?: string;
    budget?: number;
    taskId: string;
}

export async function sendTaskAssignmentMessage(
    to: string,
    task: TaskAssignmentMessage
): Promise<WhatsAppApiResponse<WhatsAppMessageResponse>> {
    const priorityEmoji = {
        URGENT: '🚨',
        HIGH: '⚡',
        NORMAL: '📋',
        LOW: '📝',
    };

    const priorityLabel = task.priority.toUpperCase();
    const emoji = priorityEmoji[priorityLabel as keyof typeof priorityEmoji] || '📋';

    let messageBody = `${emoji} *${priorityLabel} ASSIGNMENT*\n\n`;
    messageBody += `📰 *Task:* ${task.taskTitle}\n`;

    if (task.location) {
        messageBody += `📍 *Location:* ${task.location}\n`;
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        messageBody += `⏰ *Deadline:* ${deadlineDate.toLocaleString()}\n`;
    }

    if (task.description) {
        messageBody += `\n📝 *Details:*\n${task.description}\n`;
    }

    if (task.deliverables) {
        messageBody += `\n✅ *Required:*\n${task.deliverables}\n`;
    }

    if (task.budget) {
        messageBody += `\n💰 *Budget:* BD ${task.budget}\n`;
    }

    messageBody += `\n*Task ID:* #${task.taskId.substring(0, 8).toUpperCase()}`;

    return sendButtonMessage(to, messageBody, [
        { id: `accept_${task.taskId}`, title: '✓ Accept' },
        { id: `decline_${task.taskId}`, title: '✗ Decline' },
    ]);
}

// ─── Download Media ────────────────────────────────────────────────

export async function downloadMedia(mediaId: string): Promise<WhatsAppApiResponse<Blob>> {
    if (!isWhatsAppConfigured()) {
        return {
            success: false,
            error: {
                message: 'WhatsApp is not configured',
                type: 'configuration_error',
                code: 0,
            },
        };
    }

    try {
        const urlResponse = await fetch(`${getBaseUrl()}/${mediaId}`, {
            headers: {
                'Authorization': `Bearer ${config!.accessToken}`,
            },
        });

        const urlData = await urlResponse.json();

        if (!urlResponse.ok) {
            return {
                success: false,
                error: urlData.error,
            };
        }

        const mediaResponse = await fetch(urlData.url, {
            headers: {
                'Authorization': `Bearer ${config!.accessToken}`,
            },
        });

        if (!mediaResponse.ok) {
            return {
                success: false,
                error: {
                    message: 'Failed to download media',
                    type: 'download_error',
                    code: mediaResponse.status,
                },
            };
        }

        const blob = await mediaResponse.blob();

        return {
            success: true,
            data: blob,
        };
    } catch (error) {
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                type: 'network_error',
                code: 0,
            },
        };
    }
}

// ─── Get Media Metadata ────────────────────────────────────────────

export async function getMediaMetadata(mediaId: string): Promise<WhatsAppApiResponse<WhatsAppMediaResponse>> {
    if (!isWhatsAppConfigured()) {
        return {
            success: false,
            error: {
                message: 'WhatsApp is not configured',
                type: 'configuration_error',
                code: 0,
            },
        };
    }

    try {
        const response = await fetch(`${getBaseUrl()}/${mediaId}`, {
            headers: {
                'Authorization': `Bearer ${config!.accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                type: 'network_error',
                code: 0,
            },
        };
    }
}

// ─── Mark Message as Read ──────────────────────────────────────────

export async function markMessageAsRead(messageId: string): Promise<WhatsAppApiResponse<void>> {
    if (!isWhatsAppConfigured()) {
        return {
            success: false,
            error: {
                message: 'WhatsApp is not configured',
                type: 'configuration_error',
                code: 0,
            },
        };
    }

    const url = `${getBaseUrl()}/${config!.phoneNumberId}/messages`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config!.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error,
            };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                type: 'network_error',
                code: 0,
            },
        };
    }
}

// ─── Verify Webhook ────────────────────────────────────────────────

export function verifyWebhook(
    mode: string,
    token: string,
    challenge: string
): { verified: boolean; challenge?: string } {
    if (!config?.webhookVerifyToken) {
        return { verified: false };
    }

    if (mode === 'subscribe' && token === config.webhookVerifyToken) {
        return { verified: true, challenge };
    }

    return { verified: false };
}

// ─── Initialize from Settings ───────────────────────────────────────

export function initializeFromIntegrationKeys(keys: IntegrationKeys): void {
    if (keys.whatsappApiKey && keys.whatsappPhoneNumberId) {
        configureWhatsApp({
            accessToken: keys.whatsappApiKey,
            phoneNumberId: keys.whatsappPhoneNumberId,
            businessAccountId: keys.whatsappBusinessAccountId || undefined,
            webhookVerifyToken: keys.whatsappWebhookSecret || undefined,
        });
    }
}
