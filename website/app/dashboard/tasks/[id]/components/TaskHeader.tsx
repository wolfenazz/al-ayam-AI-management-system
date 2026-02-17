'use client';

import React from 'react';
import { Task } from '@/types/task';
import Badge from '@/components/ui/Badge';

interface TaskHeaderProps {
    task: Task;
}

export default function TaskHeader({ task }: TaskHeaderProps) {
    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'urgent';
            case 'HIGH': return 'high';
            case 'NORMAL': return 'normal';
            case 'LOW': return 'low';
            default: return 'neutral';
        }
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                    <span className="text-sm text-gray-500 font-mono">#{task.id.slice(0, 8)}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                        Created {new Date(task.created_at).toLocaleDateString()}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl truncate">
                    {task.title}
                </h1>
                {task.description && (
                    <div className="mt-2 text-gray-600 max-w-2xl text-sm leading-relaxed">
                        {task.description}
                    </div>
                )}
            </div>
        </div>
    );
}
