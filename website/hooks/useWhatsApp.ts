'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    queryDocuments,
    getDocument,
    setDocument,
    listenToCollection,
    COLLECTIONS,
    where,
    orderBy,
    serverTimestamp,
} from '@/lib/firebase/firestore';
import {
    sendWhatsAppMessage,
    sendTextMessage,
    sendButtonMessage,
    sendTaskAssignmentMessage,
    configureWhatsApp,
    isWhatsAppConfigured,
    initializeFromIntegrationKeys,
} from '@/lib/whatsapp/api';
import {
    generateMessageByTaskType,
    TASK_BUTTONS,
} from '@/lib/whatsapp/templates';
import { Task } from '@/types/task';
import { Employee } from '@/types/employee';
import type { IntegrationKeys } from '@/lib/validation/schemas';

// ─── Query Keys ──────────────────────────────────────────────────

const WHATSAPP_KEY = 'whatsapp';
const SETTINGS_KEY = 'settings';

// ─── Types ───────────────────────────────────────────────────────

interface WhatsAppConfig {
    isConfigured: boolean;
    phoneNumber?: string;
    businessAccountId?: string;
}

interface SendMessageParams {
    to: string;
    message: string;
    buttons?: Array<{ id: string; title: string }>;
}

interface SendTaskParams {
    task: Task;
    employee: Employee;
}

// ─── Hook: useWhatsAppConfig ─────────────────────────────────────

export function useWhatsAppConfig() {
    const [config, setConfig] = useState<WhatsAppConfig>({
        isConfigured: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadConfig() {
            try {
                const settings = await getDocument<IntegrationKeys>(
                    COLLECTIONS.SYSTEM_SETTINGS,
                    'integrations'
                );

                if (settings) {
                    initializeFromIntegrationKeys(settings);
                    setConfig({
                        isConfigured: isWhatsAppConfigured(),
                        phoneNumber: settings.whatsappNumber || undefined,
                        businessAccountId: settings.whatsappBusinessAccountId || undefined,
                    });
                }
            } catch (error) {
                console.error('Failed to load WhatsApp config:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadConfig();
    }, []);

    return { config, isLoading };
}

// ─── Hook: useSendWhatsAppMessage ────────────────────────────────

export function useSendWhatsAppMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: SendMessageParams) => {
            if (!isWhatsAppConfigured()) {
                throw new Error('WhatsApp is not configured');
            }

            if (params.buttons && params.buttons.length > 0) {
                return sendButtonMessage(params.to, params.message, params.buttons);
            }

            return sendTextMessage(params.to, params.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [WHATSAPP_KEY, 'messages'] });
        },
    });
}

// ─── Hook: useSendTaskAssignment ──────────────────────────────────

export function useSendTaskAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ task, employee }: SendTaskParams) => {
            if (!isWhatsAppConfigured()) {
                throw new Error('WhatsApp is not configured');
            }

            if (!employee.whatsapp_uid && !employee.phone_number) {
                throw new Error('Employee has no WhatsApp number');
            }

            const phoneNumber = employee.whatsapp_uid || employee.phone_number;
            if (!phoneNumber) {
                throw new Error('No valid phone number');
            }

            const message = generateMessageByTaskType({
                taskTitle: task.title,
                description: task.description,
                taskType: task.type,
                priority: task.priority,
                deadline: task.deadline,
                location: task.location,
                deliverables: task.deliverables,
                budget: task.budget,
                taskId: task.id,
                employeeName: employee.name,
            });

            const buttons = TASK_BUTTONS.accept_decline(task.id);

            const result = await sendButtonMessage(phoneNumber, message, buttons);

            if (result.success) {
                await setDocument(COLLECTIONS.TASKS, task.id, {
                    status: 'SENT',
                    sent_at: new Date().toISOString(),
                    whatsapp_thread_id: result.data?.messages?.[0]?.id,
                });
            }

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: [WHATSAPP_KEY, 'messages'] });
        },
    });
}

// ─── Hook: useWhatsAppMessages ────────────────────────────────────

export function useWhatsAppMessages(taskId: string | null) {
    const [messages, setMessages] = useState<any[]>([]);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!taskId) {
            setMessages([]);
            return;
        }

        const unsubscribe = listenToCollection<any>(
            COLLECTIONS.TASK_MESSAGES,
            [
                where('task_id', '==', taskId),
                orderBy('sent_at', 'asc'),
            ],
            (data) => {
                setMessages(data);
                setIsListening(true);
            }
        );

        return () => unsubscribe();
    }, [taskId]);

    return { messages, isLoading: !isListening };
}

// ─── Hook: useWhatsAppSettings ────────────────────────────────────

export function useWhatsAppSettings() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: [SETTINGS_KEY, 'integrations'],
        queryFn: async () => {
            const doc = await getDocument<IntegrationKeys>(
                COLLECTIONS.SYSTEM_SETTINGS,
                'integrations'
            );
            return doc;
        },
    });

    const saveSettingsMutation = useMutation({
        mutationFn: async (newSettings: IntegrationKeys) => {
            await setDocument(COLLECTIONS.SYSTEM_SETTINGS, 'integrations', {
                ...newSettings,
                updated_at: serverTimestamp(),
            });
            return newSettings;
        },
        onSuccess: (newSettings) => {
            if (newSettings) {
                initializeFromIntegrationKeys(newSettings);
            }
            queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] });
        },
    });

    return {
        settings: settings || {
            whatsappNumber: '',
            whatsappApiKey: '',
            whatsappWebhookSecret: '',
            whatsappBusinessAccountId: '',
            whatsappPhoneNumberId: '',
            deepSeekApiKey: '',
        },
        isLoading,
        saveSettings: saveSettingsMutation.mutate,
        isSaving: saveSettingsMutation.isPending,
    };
}

// ─── Hook: useWhatsAppStatus ──────────────────────────────────────

export function useWhatsAppStatus() {
    const { config, isLoading } = useWhatsAppConfig();

    const checkConnection = useCallback(async () => {
        if (!config.isConfigured) {
            return { connected: false, error: 'Not configured' };
        }

        return { connected: true, error: null };
    }, [config.isConfigured]);

    return {
        isConnected: config.isConfigured,
        isLoading,
        phoneNumber: config.phoneNumber,
        checkConnection,
    };
}
