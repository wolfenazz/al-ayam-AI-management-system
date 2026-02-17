'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateTask } from '@/hooks/useTasks';
import { Task } from '@/types/task';
import { Priority, TaskType } from '@/types/common';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
}

const taskTypes: { value: TaskType; label: string }[] = [
    { value: 'BREAKING_NEWS', label: 'Breaking News' },
    { value: 'PRESS_CONF', label: 'Press Conference' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'PHOTO_ASSIGN', label: 'Photo Assignment' },
    { value: 'VIDEO_ASSIGN', label: 'Video Assignment' },
    { value: 'FACT_CHECK', label: 'Fact Check' },
    { value: 'FOLLOW_UP', label: 'Follow-Up' },
    { value: 'CUSTOM', label: 'Custom' },
];

const priorityOptions: { value: Priority; label: string }[] = [
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'High' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'LOW', label: 'Low' },
];

export default function EditTaskModal({ isOpen, onClose, task }: EditTaskModalProps) {
    const updateTask = useUpdateTask();

    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState<Priority>(task.priority);
    const [type, setType] = useState<TaskType>(task.type);
    const [deadlineDate, setDeadlineDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('');

    useEffect(() => {
        if (task.deadline) {
            const date = new Date(task.deadline);
            setDeadlineDate(date.toISOString().split('T')[0]);
            setDeadlineTime(date.toTimeString().slice(0, 5));
        }
    }, [task.deadline]);

    if (!isOpen) return null;

    const handleSave = () => {
        const deadline = deadlineDate && deadlineTime
            ? new Date(`${deadlineDate}T${deadlineTime}`).toISOString()
            : task.deadline; // Keep old definition if not fully updated, or handle clearer logic

        updateTask.mutate({
            id: task.id,
            updates: {
                title,
                description,
                priority,
                type,
                deadline,
            }
        }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Edit Task</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as TaskType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                            >
                                {taskTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                            >
                                {priorityOptions.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={deadlineDate}
                                onChange={(e) => setDeadlineDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                            <input
                                type="time"
                                value={deadlineTime}
                                onChange={(e) => setDeadlineTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateTask.isPending}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                    >
                        {updateTask.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
