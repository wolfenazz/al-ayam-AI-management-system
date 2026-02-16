'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { mockTasks, mockEmployees } from '@/lib/mock-data';

export default function DashboardOverviewPage() {
    const { employee, user } = useAuth();
    const displayName = employee?.name || user?.displayName || 'User';
    const firstName = displayName.split(' ')[0];

    // Stats
    const totalTasks = mockTasks.length;
    const inProgress = mockTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const urgent = mockTasks.filter((t) => t.priority === 'URGENT').length;
    const completed = mockTasks.filter((t) => t.status === 'COMPLETED').length;
    const review = mockTasks.filter((t) => t.status === 'REVIEW').length;
    const activeEmployees = mockEmployees.filter((e) => e.status === 'ACTIVE').length;

    // Get current hour for greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-1">
                        {greeting}, {firstName} 👋
                    </h1>
                    <p className="text-text-secondary">
                        Here&apos;s an overview of your newsroom activity today.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <MetricCard
                        icon="assignment"
                        label="Total Tasks"
                        value={totalTasks}
                        change="+3 today"
                        color="primary"
                    />
                    <MetricCard
                        icon="trending_up"
                        label="In Progress"
                        value={inProgress}
                        change={`${review} in review`}
                        color="blue"
                    />
                    <MetricCard
                        icon="priority_high"
                        label="Urgent"
                        value={urgent}
                        change="Needs attention"
                        color="red"
                    />
                    <MetricCard
                        icon="group"
                        label="Active Staff"
                        value={activeEmployees}
                        change={`${mockEmployees.filter(e => e.availability === 'AVAILABLE').length} available`}
                        color="green"
                    />
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-bold text-text-primary">Recent Tasks</h2>
                            <Link
                                href="/dashboard/tasks"
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="divide-y divide-border">
                            {mockTasks.slice(0, 4).map((task) => {
                                const assignee = mockEmployees.find((e) => e.id === task.assignee_id);
                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-surface/50 transition-colors"
                                    >
                                        <div className={`size-2.5 rounded-full shrink-0 ${task.priority === 'URGENT' ? 'bg-accent-red' :
                                            task.priority === 'HIGH' ? 'bg-accent-orange' : 'bg-accent-green'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-primary truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {assignee?.name || 'Unassigned'} · {task.type.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                                            task.status === 'REVIEW' ? 'bg-purple-50 text-purple-700' :
                                                task.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                                    task.status === 'SENT' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {task.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Team Overview */}
                    <div className="bg-white rounded-xl border border-border shadow-sm">
                        <div className="px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-bold text-text-primary">Team Status</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {mockEmployees.slice(0, 5).map((emp) => (
                                <div
                                    key={emp.id}
                                    className="flex items-center gap-3 px-6 py-3 hover:bg-surface/50 transition-colors"
                                >
                                    {emp.avatar_url ? (
                                        <img
                                            src={emp.avatar_url}
                                            alt={emp.name}
                                            referrerPolicy="no-referrer"
                                            className="size-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                            {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{emp.name}</p>
                                        <p className="text-xs text-text-secondary">{emp.role}</p>
                                    </div>
                                    <span className={`size-2.5 rounded-full ${emp.availability === 'AVAILABLE' ? 'bg-accent-green' :
                                        emp.availability === 'BUSY' ? 'bg-accent-orange' :
                                            'bg-gray-300'
                                        }`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction icon="add_task" label="Create Task" description="Assign a new task" href="/dashboard/tasks" />
                    <QuickAction icon="bar_chart" label="Analytics" description="View performance" href="/dashboard/analytics" />
                    <QuickAction icon="chat" label="WhatsApp" description="Open chat panel" href="#" />
                </div>
            </div>
        </div>
    );
}

// ─── Sub-Components ──────────────────────────────────────────────

function MetricCard({ icon, label, value, change, color }: {
    icon: string;
    label: string;
    value: number;
    change: string;
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
            </div>
            <p className={`text-3xl font-bold ${c.text} mb-0.5`}>{value}</p>
            <p className="text-xs text-text-secondary font-medium">{label}</p>
            <p className="text-[11px] text-text-secondary mt-1">{change}</p>
        </div>
    );
}

function QuickAction({ icon, label, description, href }: {
    icon: string;
    label: string;
    description: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
        >
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
            </div>
            <div>
                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-text-secondary">{description}</p>
            </div>
        </Link>
    );
}
