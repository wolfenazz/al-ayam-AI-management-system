'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTasks, useTaskStats } from '@/hooks/useTasks';

export default function EmployeeDashboardOverview() {
    const { employee, user } = useAuth();
    const { tasks, isLoading } = useTasks();

    // Filter tasks for this employee
    const myTasks = tasks.filter(t => t.assignee_id === user?.uid);
    const stats = useTaskStats(myTasks);

    const displayName = employee?.name || user?.displayName || 'Team Member';
    const firstName = displayName.split(' ')[0];

    // Get current hour for greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-1">
                        {greeting}, {firstName} 👋
                    </h1>
                    <p className="text-text-secondary">
                        Ready for today's assignments? Here is your personal overview.
                    </p>
                </div>

                {/* Personal Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <MetricCard
                        icon="assignment"
                        label="My Tasks"
                        value={stats.total}
                        color="blue"
                    />
                    <MetricCard
                        icon="pending_actions"
                        label="In Progress"
                        value={stats.inProgress}
                        color="orange"
                    />
                    <MetricCard
                        icon="check_circle"
                        label="Completed"
                        value={stats.completed}
                        color="green"
                    />
                    <MetricCard
                        icon="star"
                        label="Performance"
                        value={employee?.performance_score || 0}
                        color="purple"
                    />
                </div>

                {/* Active Tasks List */}
                <div className="bg-white rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h2 className="text-lg font-bold text-text-primary">My Active Tasks</h2>
                        <Link
                            href="/employees-dashboard/tasks"
                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="p-6 text-center text-text-secondary">Loading tasks...</div>
                        ) : myTasks.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2 block">assignment_turned_in</span>
                                <p className="text-text-secondary">No active tasks assigned to you right now.</p>
                                <p className="text-xs text-text-secondary mt-1">Enjoy your day!</p>
                            </div>
                        ) : (
                            myTasks
                                .filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
                                .slice(0, 5)
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-surface/50 transition-colors"
                                    >
                                        <div className={`size-3 rounded-full shrink-0 ${task.priority === 'URGENT' ? 'bg-accent-red' :
                                            task.priority === 'HIGH' ? 'bg-accent-orange' : 'bg-accent-green'
                                            }`} title={`Priority: ${task.priority}`} />

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-primary truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {task.type.replace(/_/g, ' ')} · Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                            </p>
                                        </div>

                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                                            task.status === 'REVIEW' ? 'bg-purple-50 text-purple-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {task.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, color }: {
    icon: string;
    label: string;
    value: number | string;
    color: 'blue' | 'orange' | 'green' | 'purple';
}) {
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
        green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
    };
    const c = colorMap[color];

    return (
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
                <div className={`size-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${c.icon}`}>{icon}</span>
                </div>
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
    );
}
