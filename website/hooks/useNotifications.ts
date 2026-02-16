'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    queryDocuments,
    updateDocument,
    listenToCollection,
    COLLECTIONS,
    where,
    orderBy,
    limit,
} from '@/lib/firebase/firestore';
import { Notification } from '@/types/notification';
import { QueryConstraint } from 'firebase/firestore';
import { useAuth } from '@/lib/auth/AuthContext';

// ─── Query Keys ──────────────────────────────────────────────────

const NOTIFICATIONS_KEY = 'notifications';

// ─── Hooks ───────────────────────────────────────────────────────

/**
 * Fetch notifications for the current user with real-time updates.
 */
export function useNotifications(maxResults = 20) {
    const { user } = useAuth();
    const [realtimeNotifs, setRealtimeNotifs] = useState<Notification[]>([]);
    const [isListening, setIsListening] = useState(false);

    const userId = user?.uid;

    // Build constraints — if no user, return empty
    const constraints: QueryConstraint[] = userId
        ? [
            where('recipient_id', '==', userId),
            orderBy('created_at', 'desc'),
            limit(maxResults),
        ]
        : [];

    // Initial fetch
    const queryResult = useQuery<Notification[]>({
        queryKey: [NOTIFICATIONS_KEY, userId, maxResults],
        queryFn: () =>
            userId
                ? queryDocuments<Notification>(COLLECTIONS.NOTIFICATIONS, constraints)
                : Promise.resolve([]),
        enabled: !!userId,
        staleTime: 1 * 60 * 1000, // 1 minute
    });

    // Real-time listener
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = listenToCollection<Notification>(
            COLLECTIONS.NOTIFICATIONS,
            [
                where('recipient_id', '==', userId),
                orderBy('created_at', 'desc'),
                limit(maxResults),
            ],
            (data) => {
                setRealtimeNotifs(data);
                setIsListening(true);
            }
        );

        return () => unsubscribe();
    }, [userId, maxResults]);

    const notifications = isListening ? realtimeNotifs : (queryResult.data || []);
    const unreadCount = notifications.filter((n) => n.status !== 'READ').length;

    return {
        notifications,
        unreadCount,
        isLoading: queryResult.isLoading && !isListening,
        error: queryResult.error,
    };
}

/**
 * Mark a notification as read.
 */
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            await updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, {
                status: 'READ',
                read_at: new Date().toISOString(),
            });
            return notificationId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
        },
    });
}
