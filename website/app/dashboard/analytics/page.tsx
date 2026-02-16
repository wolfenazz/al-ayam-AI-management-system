'use client';

import React, { useState } from 'react';
import { useTasks, useTaskStats } from '@/hooks/useTasks';
import { useEmployees, useEmployeeStats } from '@/hooks/useEmployees';

type TimePeriod = '7d' | '30d' | '90d';

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<TimePeriod>('30d');
    const { tasks, isLoading: tasksLoading } = useTasks();
    const { employees, isLoading: employeesLoading } = useEmployees();
    const stats = useTaskStats(tasks);
    const empStats = useEmployeeStats(employees);

    const isLoading = tasksLoading || employeesLoading;

    // Compute analytics from live data
    const totalTasks = stats.total;
    const completedTasks = stats.completed;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const urgentTasks = stats.urgent;
    const avgResponseTime = Math.round(
        tasks
            .filter(t => t.response_time)
            .reduce((acc, t) => acc + (t.response_time || 0), 0) /
        (tasks.filter(t => t.response_time).length || 1) / 60
    );

    // Task distribution by type
    const tasksByType = tasks.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Task distribution by status
    const tasksByStatus = tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Employee performance
    const employeePerformance = employees
        .filter(e => e.performance_score !== undefined)
        .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary mb-1">Analytics</h1>
                        <p className="text-text-secondary text-sm">
                            Monitor newsroom performance and task efficiency.
                        </p>
                    </div>
                    <div className="flex gap-1 bg-white p-1 rounded-lg border border-border shadow-sm">
                        {([
                            { value: '7d', label: '7 Days' },
                            { value: '30d', label: '30 Days' },
                            { value: '90d', label: '90 Days' },
                        ] as { value: TimePeriod; label: string }[]).map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p.value
                                    ? 'bg-primary text-white'
                                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Metrics */}
                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border p-5 shadow-sm animate-pulse">
                                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                                <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
                                <div className="h-4 w-24 bg-gray-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <BigMetric icon="speed" label="Completion Rate" value={`${completionRate}%`} subtext={`${completedTasks} of ${totalTasks} tasks`} color="primary" />
                        <BigMetric icon="timer" label="Avg Response" value={`${avgResponseTime}m`} subtext="Time to accept tasks" color="blue" />
                        <BigMetric icon="warning" label="Urgent Tasks" value={urgentTasks.toString()} subtext="Requiring immediate attention" color="red" />
                        <BigMetric icon="group" label="Active Team" value={empStats.active.toString()} subtext={`${empStats.available} currently available`} color="green" />
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border shadow-sm p-6 animate-pulse">
                                <div className="h-5 w-48 bg-gray-200 rounded mb-6" />
                                <div className="space-y-4">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div key={j}>
                                            <div className="flex justify-between mb-1.5">
                                                <div className="h-4 w-24 bg-gray-200 rounded" />
                                                <div className="h-4 w-16 bg-gray-100 rounded" />
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Task Distribution by Status */}
                        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                            <h3 className="text-base font-bold text-text-primary mb-5">Task Breakdown by Status</h3>
                            {Object.keys(tasksByStatus).length === 0 ? (
                                <p className="text-sm text-text-secondary">No task data available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(tasksByStatus).map(([status, count]) => {
                                        const percentage = Math.round((count / totalTasks) * 100);
                                        const statusConfig: Record<string, { color: string; label: string }> = {
                                            IN_PROGRESS: { color: 'bg-blue-500', label: 'In Progress' },
                                            SENT: { color: 'bg-amber-500', label: 'Sent' },
                                            REVIEW: { color: 'bg-purple-500', label: 'In Review' },
                                            COMPLETED: { color: 'bg-accent-green', label: 'Completed' },
                                            ACCEPTED: { color: 'bg-teal-500', label: 'Accepted' },
                                            DRAFT: { color: 'bg-gray-400', label: 'Draft' },
                                        };
                                        const cfg = statusConfig[status] || { color: 'bg-gray-400', label: status };

                                        return (
                                            <div key={status}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-medium text-text-primary">{cfg.label}</span>
                                                    <span className="text-sm font-bold text-text-primary">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${cfg.color} rounded-full transition-all duration-500`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Task Distribution by Type */}
                        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                            <h3 className="text-base font-bold text-text-primary mb-5">Task Types</h3>
                            {Object.keys(tasksByType).length === 0 ? (
                                <p className="text-sm text-text-secondary">No task data available.</p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(tasksByType).map(([type, count]) => {
                                        const percentage = Math.round((count / totalTasks) * 100);
                                        const typeIcons: Record<string, string> = {
                                            BREAKING_NEWS: 'bolt',
                                            FACT_CHECK: 'fact_check',
                                            INTERVIEW: 'mic',
                                            PRESS_CONF: 'podium',
                                            FOLLOW_UP: 'replay',
                                            PHOTO_ASSIGN: 'photo_camera',
                                        };

                                        return (
                                            <div
                                                key={type}
                                                className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors"
                                            >
                                                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <span className="material-symbols-outlined text-[20px]">{typeIcons[type] || 'article'}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-text-primary">{type.replace(/_/g, ' ')}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-text-secondary">{count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Employee Performance */}
                <div className="bg-white rounded-xl border border-border shadow-sm">
                    <div className="px-6 py-4 border-b border-border">
                        <h3 className="text-base font-bold text-text-primary">Team Performance</h3>
                        <p className="text-xs text-text-secondary mt-0.5">Ranked by performance score</p>
                    </div>
                    <div className="divide-y divide-border">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                                    <div className="size-8 bg-gray-200 rounded-lg" />
                                    <div className="size-10 bg-gray-200 rounded-full" />
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                                        <div className="h-3 w-20 bg-gray-100 rounded" />
                                    </div>
                                    <div className="h-4 w-12 bg-gray-200 rounded" />
                                </div>
                            ))
                        ) : employeePerformance.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                                <p className="text-sm text-text-secondary">No performance data available.</p>
                            </div>
                        ) : (
                            employeePerformance.map((emp, index) => (
                                <div
                                    key={emp.id}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-surface/30 transition-colors"
                                >
                                    {/* Rank */}
                                    <div className={`size-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-600' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-surface text-text-secondary'
                                        }`}>
                                        {index + 1}
                                    </div>

                                    {/* Avatar */}
                                    {emp.avatar_url ? (
                                        <img
                                            src={emp.avatar_url}
                                            alt={emp.name}
                                            referrerPolicy="no-referrer"
                                            className="size-10 rounded-full object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                            {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-text-primary truncate">{emp.name}</p>
                                        <p className="text-xs text-text-secondary">{emp.role} · {emp.department}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden sm:flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-text-primary">{emp.total_tasks_completed}</p>
                                            <p className="text-[10px] text-text-secondary uppercase">Tasks</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-text-primary">{emp.response_time_avg ? Math.round(emp.response_time_avg / 60) : '—'}m</p>
                                            <p className="text-[10px] text-text-secondary uppercase">Avg Response</p>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                            <div
                                                className={`h-full rounded-full ${(emp.performance_score || 0) >= 90 ? 'bg-accent-green' :
                                                    (emp.performance_score || 0) >= 75 ? 'bg-blue-500' :
                                                        'bg-accent-orange'
                                                    }`}
                                                style={{ width: `${emp.performance_score || 0}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-bold min-w-[3ch] text-right ${(emp.performance_score || 0) >= 90 ? 'text-accent-green' :
                                            (emp.performance_score || 0) >= 75 ? 'text-blue-600' :
                                                'text-accent-orange'
                                            }`}>
                                            {emp.performance_score}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-Components ──────────────────────────────────────────────

function BigMetric({ icon, label, value, subtext, color }: {
    icon: string;
    label: string;
    value: string;
    subtext: string;
    color: 'primary' | 'blue' | 'red' | 'green';
}) {
    const colorMap = {
        primary: { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
        red: { bg: 'bg-accent-red/10', text: 'text-accent-red', icon: 'text-accent-red' },
        green: { bg: 'bg-accent-green/10', text: 'text-accent-green', icon: 'text-accent-green' },
    };
    const c = colorMap[color];

    return (
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`size-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[22px] ${c.icon}`}>{icon}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-text-secondary">trending_up</span>
            </div>
            <p className={`text-3xl font-bold ${c.text} mb-0.5`}>{value}</p>
            <p className="text-xs font-medium text-text-secondary">{label}</p>
            <p className="text-[11px] text-text-secondary mt-1.5">{subtext}</p>
        </div>
    );
}
