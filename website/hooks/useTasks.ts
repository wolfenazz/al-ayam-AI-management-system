'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    queryDocuments,
    setDocument,
    updateDocument,
    deleteDocument,
    listenToCollection,
    listenToDocument,
    COLLECTIONS,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
} from '@/lib/firebase/firestore';
import { Task, TaskFilters } from '@/types/task';
import { QueryConstraint } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// ─── Query Keys ──────────────────────────────────────────────────

const TASKS_KEY = 'tasks';

// ─── Build Firestore Constraints ─────────────────────────────────

function buildConstraints(filters?: TaskFilters): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    if (filters?.status && filters.status.length > 0) {
        // Firestore 'in' supports up to 30 values
        constraints.push(where('status', 'in', filters.status));
    }

    if (filters?.priority && filters.priority.length > 0) {
        constraints.push(where('priority', 'in', filters.priority));
    }

    if (filters?.assignee_id) {
        constraints.push(where('assignee_id', '==', filters.assignee_id));
    }

    // Default ordering
    constraints.push(orderBy('created_at', 'desc'));

    return constraints;
}

// ─── Hooks ───────────────────────────────────────────────────────

/**
 * Fetch tasks with optional filters and real-time updates.
 */
export function useTasks(filters?: TaskFilters) {
    const [realtimeTasks, setRealtimeTasks] = useState<Task[]>([]);
    const [isListening, setIsListening] = useState(false);

    // Initial fetch via React Query
    const queryResult = useQuery<Task[]>({
        queryKey: [TASKS_KEY, filters],
        queryFn: () => queryDocuments<Task>(COLLECTIONS.TASKS, buildConstraints(filters)),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Real-time listener
    useEffect(() => {
        const constraints = buildConstraints(filters);
        const unsubscribe = listenToCollection<Task>(
            COLLECTIONS.TASKS,
            constraints,
            (data) => {
                setRealtimeTasks(data);
                setIsListening(true);
            }
        );

        return () => unsubscribe();
    }, [filters]);

    // Use real-time data if available, otherwise fall back to query data
    const tasks = isListening ? realtimeTasks : (queryResult.data || []);

    // Client-side search filter (Firestore doesn't support full-text search)
    const filteredTasks = filters?.search
        ? tasks.filter(
            (t) =>
                t.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
                t.description?.toLowerCase().includes(filters.search!.toLowerCase())
        )
        : tasks;

    return {
        tasks: filteredTasks,
        isLoading: queryResult.isLoading && !isListening,
        error: queryResult.error,
        refetch: queryResult.refetch,
    };
}

/**
 * Fetch a single task by ID with real-time updates.
 */
export function useTask(taskId: string | null) {
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!taskId) {
            setTask(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = listenToDocument<Task>(
            COLLECTIONS.TASKS,
            taskId,
            (data) => {
                setTask(data);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [taskId]);

    return { task, isLoading };
}

/**
 * Create a new task.
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskData: Omit<Task, 'id' | 'created_at'>) => {
            const id = uuidv4();
            const task = {
                ...taskData,
                created_at: new Date().toISOString(),
            };
            await setDocument(COLLECTIONS.TASKS, id, {
                ...task,
                created_at: serverTimestamp(),
            }, false);
            return { id, ...task } as Task;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
        },
    });
}

/**
 * Update a task.
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
            await updateDocument(COLLECTIONS.TASKS, id, updates);
            return { id, ...updates };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
        },
    });
}

/**
 * Delete a task.
 */
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId: string) => {
            await deleteDocument(COLLECTIONS.TASKS, taskId);
            return taskId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
        },
    });
}

/**
 * Compute task statistics from an array of tasks.
 */
export function useTaskStats(tasks: Task[]) {
    return {
        total: tasks.length,
        inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        urgent: tasks.filter((t) => t.priority === 'URGENT').length,
        completed: tasks.filter((t) => t.status === 'COMPLETED').length,
        review: tasks.filter((t) => t.status === 'REVIEW').length,
        sent: tasks.filter((t) => t.status === 'SENT').length,
        draft: tasks.filter((t) => t.status === 'DRAFT').length,
        accepted: tasks.filter((t) => t.status === 'ACCEPTED').length,
    };
}
