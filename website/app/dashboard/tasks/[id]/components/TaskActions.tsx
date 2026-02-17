'use client';

import React from 'react';
import { useDeleteTask } from '@/hooks/useTasks';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';

interface TaskActionsProps {
    task: Task;
    onAssign: () => void;
    onEdit: () => void;
}

export default function TaskActions({ task, onAssign, onEdit }: TaskActionsProps) {
    const router = useRouter();
    const deleteTask = useDeleteTask();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            deleteTask.mutate(task.id, {
                onSuccess: () => {
                    router.push('/dashboard/tasks');
                },
            });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm active:scale-95 transition-all"
            >
                Edit Task
            </button>
            <button
                onClick={onAssign}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm active:scale-95 transition-all"
            >
                Assign
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            <button
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-transparent rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm disabled:opacity-50 active:scale-95 transition-all"
            >
                {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    );
}
