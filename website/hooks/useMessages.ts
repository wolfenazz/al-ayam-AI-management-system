'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    queryDocuments,
    setDocument,
    listenToCollection,
    COLLECTIONS,
    where,
    orderBy,
    serverTimestamp,
} from '@/lib/firebase/firestore';
import { TaskMessage } from '@/types/message';
import { QueryConstraint } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// ─── Query Keys ──────────────────────────────────────────────────

const MESSAGES_KEY = 'messages';

// ─── Hooks ───────────────────────────────────────────────────────

/**
 * Fetch messages for a specific task with real-time updates.
 */
export function useMessages(taskId: string | null) {
    const [realtimeMessages, setRealtimeMessages] = useState<TaskMessage[]>([]);
    const [isListening, setIsListening] = useState(false);

    // Build constraints
    const constraints: QueryConstraint[] = taskId
        ? [where('task_id', '==', taskId), orderBy('sent_at', 'asc')]
        : [];

    // Initial fetch
    const queryResult = useQuery<TaskMessage[]>({
        queryKey: [MESSAGES_KEY, taskId],
        queryFn: () =>
            taskId
                ? queryDocuments<TaskMessage>(COLLECTIONS.TASK_MESSAGES, constraints)
                : Promise.resolve([]),
        enabled: !!taskId,
        staleTime: 1 * 60 * 1000,
    });

    // Real-time listener
    useEffect(() => {
        if (!taskId) return;

        const unsubscribe = listenToCollection<TaskMessage>(
            COLLECTIONS.TASK_MESSAGES,
            [where('task_id', '==', taskId), orderBy('sent_at', 'asc')],
            (data) => {
                setRealtimeMessages(data);
                setIsListening(true);
            }
        );

        return () => unsubscribe();
    }, [taskId]);

    const messages = isListening ? realtimeMessages : (queryResult.data || []);

    return {
        messages,
        isLoading: queryResult.isLoading && !isListening,
        error: queryResult.error,
    };
}

/**
 * Send a message to a task thread.
 */
export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            messageData: Omit<TaskMessage, 'id' | 'sent_at'>
        ) => {
            const id = uuidv4();
            const message = {
                ...messageData,
                sent_at: new Date().toISOString(),
            };
            await setDocument(COLLECTIONS.TASK_MESSAGES, id, {
                ...message,
                sent_at: serverTimestamp(),
            }, false);
            return { id, ...message } as TaskMessage;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [MESSAGES_KEY, data.task_id] });
        },
    });
}
