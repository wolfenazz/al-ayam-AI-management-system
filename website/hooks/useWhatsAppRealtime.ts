'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    queryDocuments,
    listenToCollection,
    updateDocument,
    COLLECTIONS,
    where,
    orderBy,
} from '@/lib/firebase/firestore';
import { TaskMessage } from '@/types/message';
import { isWhatsAppConfigured, markMessageAsRead } from '@/lib/whatsapp/api';

// ─── Query Keys ──────────────────────────────────────────────────

const WHATSAPP_REALTIME_KEY = 'whatsapp-realtime';

// ─── Types ───────────────────────────────────────────────────────

export interface WhatsAppMessage extends TaskMessage {
    whatsapp_message_id?: string;
    direction: 'INBOUND' | 'OUTBOUND';
    status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    metadata?: {
        parsed_action?: unknown;
        extracted_data?: unknown;
        button_response?: unknown;
    };
}

interface UseWhatsAppRealtimeOptions {
    taskId: string | null;
    employeeId?: string;
    enabled?: boolean;
}

interface UseWhatsAppRealtimeReturn {
    messages: WhatsAppMessage[];
    isLoading: boolean;
    error: Error | null;
    markAsRead: (messageId: string) => Promise<void>;
    refreshMessages: () => Promise<void>;
    unreadCount: number;
    lastMessage: WhatsAppMessage | null;
}

// ─── Hook: useWhatsAppRealtime ─────────────────────────────────────

export function useWhatsAppRealtime({
    taskId,
    employeeId,
    enabled = true,
}: UseWhatsAppRealtimeOptions): UseWhatsAppRealtimeReturn {
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isListening, setIsListening] = useState(false);

    // Fetch initial messages
    const fetchMessages = useCallback(async () => {
        if (!taskId || !enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const fetchedMessages = await queryDocuments<WhatsAppMessage>(
                COLLECTIONS.TASK_MESSAGES,
                [
                    where('task_id', '==', taskId),
                    orderBy('sent_at', 'asc'),
                ]
            );

            setMessages(fetchedMessages);
        } catch (err) {
            console.error('Failed to fetch WhatsApp messages:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
        } finally {
            setIsLoading(false);
        }
    }, [taskId, enabled]);

    // Real-time listener for new messages
    useEffect(() => {
        if (!taskId || !enabled) {
            setMessages([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsListening(false);

        const unsubscribe = listenToCollection<WhatsAppMessage>(
            COLLECTIONS.TASK_MESSAGES,
            [
                where('task_id', '==', taskId),
                orderBy('sent_at', 'asc'),
            ],
            (data) => {
                setMessages(data);
                setIsListening(true);
                setIsLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [taskId, enabled]);

    // Mark message as read
    const markAsRead = useCallback(async (messageId: string) => {
        try {
            // Update in Firestore
            await updateDocument(COLLECTIONS.TASK_MESSAGES, messageId, {
                status: 'READ',
                read_at: new Date().toISOString(),
            });

            // If WhatsApp is configured, mark on WhatsApp too
            if (isWhatsAppConfigured()) {
                const message = messages.find(m => m.id === messageId);
                if (message?.whatsapp_message_id) {
                    await markMessageAsRead(message.whatsapp_message_id);
                }
            }
        } catch (err) {
            console.error('Failed to mark message as read:', err);
            throw err;
        }
    }, [messages]);

    // Calculate unread count (incoming messages not yet read)
    const unreadCount = messages.filter(
        (msg) => msg.direction === 'INBOUND' && msg.status !== 'READ'
    ).length;

    // Get last message
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return {
        messages,
        isLoading: isLoading && !isListening,
        error,
        markAsRead,
        refreshMessages: fetchMessages,
        unreadCount,
        lastMessage,
    };
}

// ─── Hook: useWhatsAppUnreadCount ──────────────────────────────────

export function useWhatsAppUnreadCount(employeeId?: string): {
    unreadCount: number;
    isLoading: boolean;
} {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!employeeId) {
            setUnreadCount(0);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Query for all unread messages for this employee
        const unsubscribe = listenToCollection<WhatsAppMessage>(
            COLLECTIONS.TASK_MESSAGES,
            [
                where('direction', '==', 'INBOUND'),
                where('status', 'in', ['SENT', 'DELIVERED']),
            ],
            (data) => {
                // Filter by task assignee if employeeId provided
                // This requires fetching tasks and filtering messages
                // For now, just return the count
                setUnreadCount(data.length);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [employeeId]);

    return { unreadCount, isLoading };
}

// ─── Hook: useWhatsAppStatus ───────────────────────────────────────

export function useWhatsAppMessageStatus(messageId: string | null): {
    status: WhatsAppMessage['status'] | null;
    deliveredAt?: string;
    readAt?: string;
    isLoading: boolean;
} {
    const [status, setStatus] = useState<WhatsAppMessage['status'] | null>(null);
    const [deliveredAt, setDeliveredAt] = useState<string | undefined>();
    const [readAt, setReadAt] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!messageId) {
            setStatus(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Initial fetch
        queryDocuments<WhatsAppMessage>(
            COLLECTIONS.TASK_MESSAGES,
            [where('id', '==', messageId)]
        ).then((messages) => {
            if (messages.length > 0) {
                const msg = messages[0];
                setStatus(msg.status);
                setDeliveredAt(msg.delivered_at);
                setReadAt(msg.read_at);
            }
            setIsLoading(false);
        });

        // Real-time updates
        const unsubscribe = listenToCollection<WhatsAppMessage>(
            COLLECTIONS.TASK_MESSAGES,
            [where('id', '==', messageId)],
            (data) => {
                if (data.length > 0) {
                    const msg = data[0];
                    setStatus(msg.status);
                    setDeliveredAt(msg.delivered_at);
                    setReadAt(msg.read_at);
                }
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [messageId]);

    return { status, deliveredAt, readAt, isLoading };
}
