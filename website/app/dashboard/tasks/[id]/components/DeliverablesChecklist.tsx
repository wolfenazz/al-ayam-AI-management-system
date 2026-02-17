'use client';

import React, { useState } from 'react';
import { useUpdateTask } from '@/hooks/useTasks';
import { Task } from '@/types/task';

interface DeliverablesChecklistProps {
    task: Task;
}

interface DeliverableItem {
    name: string;
    completed: boolean;
}

export default function DeliverablesChecklist({ task }: DeliverablesChecklistProps) {
    const updateTask = useUpdateTask();
    const [isEditing, setIsEditing] = useState(false);

    const deliverables = Object.entries(task.deliverables || {}).map(([name, completed]) => ({
        name,
        completed: completed === 1,
    }));

    const handleToggle = (name: string) => {
        const newDeliverables = {
            ...(task.deliverables || {}),
            [name]: !task.deliverables?.[name] ? 1 : 0,
        };

        updateTask.mutate({
            id: task.id,
            updates: { deliverables: newDeliverables }
        });
    };

    const handleAdd = (name: string) => {
        if (!name.trim()) return;

        const newDeliverables = {
            ...(task.deliverables || {}),
            [name.trim()]: 0,
        };

        updateTask.mutate({
            id: task.id,
            updates: { deliverables: newDeliverables }
        });
        setIsEditing(false);
    };

    const handleRemove = (name: string) => {
        const newDeliverables = { ...(task.deliverables || {}) };
        delete newDeliverables[name];

        updateTask.mutate({
            id: task.id,
            updates: { deliverables: newDeliverables }
        });
    };

    const completedCount = deliverables.filter(d => d.completed).length;
    const totalCount = deliverables.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">Deliverables</h3>
                    {totalCount > 0 && (
                        <span className="text-sm text-gray-500">
                            {completedCount}/{totalCount} completed
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                    {isEditing ? 'Cancel' : 'Add Item'}
                </button>
            </div>

            {totalCount > 0 && (
                <div className="mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-right">{progress}%</p>
                </div>
            )}

            {deliverables.length === 0 && !isEditing ? (
                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">checklist</span>
                    <p className="text-sm text-gray-500">No deliverables added yet</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-2 text-sm font-medium text-primary hover:underline"
                    >
                        Add deliverables
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {deliverables.map((deliverable) => (
                        <div
                            key={deliverable.name}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <button
                                onClick={() => handleToggle(deliverable.name)}
                                className={`
                                    shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                                    ${deliverable.completed
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }
                                `}
                            >
                                {deliverable.completed && (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                )}
                            </button>
                            <span className={`flex-1 ${deliverable.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {deliverable.name}
                            </span>
                            <button
                                onClick={() => handleRemove(deliverable.name)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isEditing && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleAdd(formData.get('name') as string);
                    }}
                    className="mt-4 flex gap-2"
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Deliverable name"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                    >
                        Add
                    </button>
                </form>
            )}
        </div>
    );
}
