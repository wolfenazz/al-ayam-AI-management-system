'use client';

import React from 'react';
import TaskCard from './components/TaskCard';
import { useUIStore } from '@/stores/uiStore';
import { mockTasks, mockEmployees } from '@/lib/mock-data';

export default function TasksPage() {
    const { viewMode, setViewMode } = useUIStore();

    const getEmployee = (assigneeId?: string) =>
        assigneeId ? mockEmployees.find((e) => e.id === assigneeId) : undefined;

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary mb-1">
                            Task Management
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Track breaking news assignments and field updates.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-border shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'text-primary bg-primary-light' : 'hover:bg-surface text-text-secondary'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'text-primary bg-primary-light' : 'hover:bg-surface text-text-secondary'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">view_list</span>
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        icon="assignment"
                        label="Total Tasks"
                        value={mockTasks.length.toString()}
                        color="primary"
                    />
                    <StatCard
                        icon="pending_actions"
                        label="In Progress"
                        value={mockTasks.filter((t) => t.status === 'IN_PROGRESS').length.toString()}
                        color="blue"
                    />
                    <StatCard
                        icon="priority_high"
                        label="Urgent"
                        value={mockTasks.filter((t) => t.priority === 'URGENT').length.toString()}
                        color="red"
                    />
                    <StatCard
                        icon="check_circle"
                        label="Completed"
                        value={mockTasks.filter((t) => t.status === 'COMPLETED').length.toString()}
                        color="green"
                    />
                </div>

                {/* Tasks Grid */}
                <div
                    className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6'
                            : 'flex flex-col gap-4'
                    }
                >
                    {mockTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            employee={getEmployee(task.assignee_id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: string;
    label: string;
    value: string;
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
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`size-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[22px] ${c.icon}`}>{icon}</span>
            </div>
            <div>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                <p className="text-xs text-text-secondary font-medium">{label}</p>
            </div>
        </div>
    );
}
