'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { TaskStatus, Priority } from '@/types/common';

export default function EmployeeTasksPage() {
    const { user } = useAuth();
    const { tasks, isLoading } = useTasks();
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');

    // Filter tasks for this employee
    const myTasks = tasks
        .filter(t => t.assignee_id === user?.uid)
        .filter(t => statusFilter === 'ALL' || t.status === statusFilter)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const statusOptions: { label: string; value: TaskStatus | 'ALL' }[] = [
        { label: 'All Tasks', value: 'ALL' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'In Review', value: 'REVIEW' },
        { label: 'Completed', value: 'COMPLETED' },
    ];

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">My Tasks</h1>
                        <p className="text-text-secondary">Manage your assigned work</p>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {statusOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === opt.value
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-text-secondary">Loading tasks...</div>
                    ) : myTasks.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-gray-400">assignment</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-1">No tasks found</h3>
                            <p className="text-text-secondary">
                                {statusFilter === 'ALL'
                                    ? "You don't have any tasks assigned yet."
                                    : `No tasks found with status "${statusFilter.replace(/_/g, ' ')}".`}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {myTasks.map((task) => (
                                <div key={task.id} className="p-6 hover:bg-surface/50 transition-colors group">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${task.location ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {task.type.replace(/_/g, ' ')}
                                            </span>
                                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${task.priority === 'URGENT' ? 'bg-red-50 text-red-700 border-red-200' :
                                                task.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                <span className="material-symbols-outlined text-[12px] filled">flag</span>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <span className="text-xs text-text-secondary flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                                        {task.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                                        {task.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-4">
                                            {task.location && task.location.address && (
                                                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                    <span className="material-symbols-outlined text-[16px] text-red-500">location_on</span>
                                                    <span>{task.location.address}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Status Badge */}
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                task.status === 'REVIEW' ? 'bg-purple-100 text-purple-700' :
                                                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {task.status.replace(/_/g, ' ')}
                                            </span>

                                            {/* Action Button (Placeholder for now, could open details modal) */}
                                            {/* <button className="size-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
