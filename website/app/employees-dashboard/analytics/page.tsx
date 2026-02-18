'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { TaskType, TaskStatus } from '@/types/common';

export default function EmployeeAnalyticsPage() {
    const { user } = useAuth();
    const { tasks, isLoading } = useTasks();

    const myTasks = tasks.filter(t => t.assignee_id === user?.uid);
    const total = myTasks.length;

    // Stats calculation
    const completed = myTasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const review = myTasks.filter(t => t.status === 'REVIEW').length;
    const overdue = myTasks.filter(t => t.status === 'OVERDUE').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Type distribution
    const typeDistribution = myTasks.reduce((acc, task) => {
        const type = task.type.replace(/_/g, ' ');
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Sort types by count
    const sortedTypes = Object.entries(typeDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">Performance Analytics</h1>
                    <p className="text-text-secondary">Detailed breakdown of your work performance</p>
                </div>

                {isLoading ? (
                    <div className="text-center p-8">Loading analytics...</div>
                ) : total === 0 ? (
                    <div className="text-center p-12 bg-card rounded-xl border border-border">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">bar_chart</span>
                        <p className="text-text-secondary">No data available for analytics yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Completion Rate Card */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-text-primary mb-6">Completion Rate</h3>
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative size-40">
                                    <svg className="size-full rotate-90d" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#f1f5f9"
                                            strokeWidth="4"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke={completionRate > 75 ? '#22c55e' : completionRate > 50 ? '#3b82f6' : '#eab308'}
                                            strokeWidth="4"
                                            strokeDasharray={`${completionRate}, 100`}
                                            className="animate-[progress_1s_ease-out_forwards]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-text-primary">{completionRate}%</span>
                                        <span className="text-xs text-text-secondary">Completed</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-surface rounded-lg">
                                    <p className="text-2xl font-bold text-text-primary">{completed}</p>
                                    <p className="text-xs text-text-secondary">Completed Tasks</p>
                                </div>
                                <div className="p-3 bg-surface rounded-lg">
                                    <p className="text-2xl font-bold text-text-primary">{total}</p>
                                    <p className="text-xs text-text-secondary">Total Assigned</p>
                                </div>
                            </div>
                        </div>

                        {/* Task Status Breakdown */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-text-primary mb-6">Workload Status</h3>
                            <div className="space-y-4">
                                <StatusUpdateBar label="In Progress" value={inProgress} total={total} color="bg-blue-500" />
                                <StatusUpdateBar label="In Review" value={review} total={total} color="bg-purple-500" />
                                <StatusUpdateBar label="Completed" value={completed} total={total} color="bg-green-500" />
                                <StatusUpdateBar label="Overdue" value={overdue} total={total} color="bg-red-500" />
                            </div>
                        </div>

                        {/* Task Type Distribution */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm md:col-span-2">
                            <h3 className="text-lg font-bold text-text-primary mb-6">Task Types</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedTypes.map(([type, count]) => (
                                    <div key={type} className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border">
                                        <div className="size-10 rounded-lg bg-card flex items-center justify-center shadow-sm text-primary">
                                            <span className="material-symbols-outlined text-[20px]">category</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary uppercase tracking-wide text-[10px] sm:text-xs">
                                                {type}
                                            </p>
                                            <p className="text-xl font-bold text-text-primary">{count}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusUpdateBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-primary font-medium">{label}</span>
                    <span className="text-text-secondary">{value} ({Math.round(percentage)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${color} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
    );
}
