'use client';

import React, { useState } from 'react';
import TaskCard from './components/TaskCard';
import TaskRow from './components/TaskRow';
import TaskDetailModal from './components/TaskDetailModal';
import { useUIStore } from '@/stores/uiStore';
import { useTasks, useTaskStats, useBulkUpdateTasks, useBulkDeleteTasks } from '@/hooks/useTasks';
import { useEmployees, getEmployeeById } from '@/hooks/useEmployees';
import { TaskStatus } from '@/types/common';

export default function TasksPage() {
    const { viewMode, setViewMode } = useUIStore();
    const { tasks, isLoading: tasksLoading } = useTasks();
    const { employees, isLoading: employeesLoading } = useEmployees();
    const stats = useTaskStats(tasks);
    const bulkUpdate = useBulkUpdateTasks();
    const bulkDelete = useBulkDeleteTasks();

    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [modalTaskId, setModalTaskId] = useState<string | null>(null);

    const isLoading = tasksLoading || employeesLoading;

    const getEmployee = (assigneeId?: string) =>
        getEmployeeById(employees, assigneeId);

    const selectedTask = tasks.find(t => t.id === modalTaskId) || null;
    const selectedTaskEmployee = selectedTask ? getEmployee(selectedTask.assignee_id) : undefined;
    const selectedTaskCreator = selectedTask ? getEmployee(selectedTask.creator_id) : undefined;

    const handleViewTaskDetails = (taskId: string) => {
        setModalTaskId(taskId);
    };

    const handleCloseModal = () => {
        setModalTaskId(null);
    };

    // Selection Handlers
    const handleSelectTask = (taskId: string) => {
        const newSelected = new Set(selectedTaskIds);
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId);
        } else {
            newSelected.add(taskId);
        }
        setSelectedTaskIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedTaskIds.size === tasks.length) {
            setSelectedTaskIds(new Set());
        } else {
            setSelectedTaskIds(new Set(tasks.map(t => t.id)));
        }
    };

    const handleBulkAction = async (action: 'APPROVE' | 'REJECT' | 'DELETE' | 'MARK_COMPLETED') => {
        if (selectedTaskIds.size === 0) return;

        const ids = Array.from(selectedTaskIds);

        try {
            if (action === 'DELETE') {
                if (window.confirm(`Are you sure you want to delete ${ids.length} tasks?`)) {
                    await bulkDelete.mutateAsync(ids);
                    setSelectedTaskIds(new Set());
                }
            } else {
                let status: TaskStatus | undefined;
                if (action === 'APPROVE') status = 'ACCEPTED';
                if (action === 'REJECT') status = 'REJECTED';
                if (action === 'MARK_COMPLETED') status = 'COMPLETED';

                if (status) {
                    await bulkUpdate.mutateAsync({ ids, updates: { status } });
                    setSelectedTaskIds(new Set());
                }
            }
        } catch (error) {
            console.error("Bulk action failed:", error);
            alert("Failed to perform bulk action.");
        }
    };

    return (
        <div className="p-8 relative min-h-screen">
            <div className="max-w-7xl mx-auto pb-24">
                {/* Page Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                            Task Management
                        </h1>
                        <p className="text-text-secondary text-base mt-2">
                            Track breaking news tasks and field updates.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-card p-1.5 rounded-xl border border-border shadow-sm">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-5 shadow-sm animate-pulse">
                                <div className="size-11 bg-gray-200 rounded-xl" />
                                <div>
                                    <div className="h-7 w-16 bg-gray-200 rounded-lg mb-2" />
                                    <div className="h-4 w-20 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <StatCard
                                icon="task"
                                label="Total Tasks"
                                value={stats.total.toString()}
                                color="primary"
                            />
                            <StatCard
                                icon="pending_actions"
                                label="In Progress"
                                value={stats.inProgress.toString()}
                                color="blue"
                            />
                            <StatCard
                                icon="priority_high"
                                label="Urgent"
                                value={stats.urgent.toString()}
                                color="red"
                            />
                            <StatCard
                                icon="check_circle"
                                label="Completed"
                                value={stats.completed.toString()}
                                color="green"
                            />
                        </>
                    )}
                </div>

                {/* Select All Bar (List Mode Only) */}
                {viewMode === 'list' && !isLoading && tasks.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-surface rounded-lg border border-transparent hover:border-border transition-colors">
                        <input
                            type="checkbox"
                            checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                            onChange={handleSelectAll}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-text-secondary">Select All</span>
                        {selectedTaskIds.size > 0 && (
                            <span className="text-sm text-primary font-bold ml-auto">{selectedTaskIds.size} selected</span>
                        )}
                    </div>
                )}

                {/* Tasks Content */}
                {isLoading ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8' : 'flex flex-col gap-3'}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-card rounded-2xl border border-border p-8 shadow-sm animate-pulse">
                                <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-4" />
                                <div className="h-5 w-1/2 bg-gray-100 rounded mb-3" />
                                <div className="h-5 w-2/3 bg-gray-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-16 text-center shadow-sm">
                        <span className="material-symbols-outlined text-[72px] text-gray-300 mb-4 block">task</span>
                        <p className="text-xl font-semibold text-text-primary mb-2">No tasks yet</p>
                        <p className="text-base text-text-secondary">Create your first task or seed sample data from the dashboard.</p>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8'
                                : 'flex flex-col gap-3'
                        }
                    >
                        {viewMode === 'grid' ? (
                            tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    employee={getEmployee(task.assignee_id)}
                                    onViewDetails={handleViewTaskDetails}
                                />
                            ))
                        ) : (
                            tasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    employee={getEmployee(task.assignee_id)}
                                    isSelected={selectedTaskIds.has(task.id)}
                                    onSelect={handleSelectTask}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Bulk Actions Floating Bar */}
            {selectedTaskIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card rounded-full shadow-2xl border border-border p-2 px-6 flex items-center gap-4 z-40 animate-slide-up">
                    <div className="flex items-center gap-2 pr-4 border-r border-border">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                            {selectedTaskIds.size}
                        </div>
                        <span className="text-sm font-semibold text-text-primary">Selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('APPROVE')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-green-50 text-green-700 font-medium text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Approve
                        </button>
                        <button
                            onClick={() => handleBulkAction('REJECT')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-50 text-red-700 font-medium text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Reject
                        </button>
                        <button
                            onClick={() => handleBulkAction('MARK_COMPLETED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-blue-50 text-blue-700 font-medium text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">done_all</span>
                            Complete
                        </button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <button
                            onClick={() => handleBulkAction('DELETE')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Delete
                        </button>
                        <button
                            onClick={() => setSelectedTaskIds(new Set())}
                            className="ml-2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Task Detail Modal */}
            <TaskDetailModal
                task={selectedTask}
                employee={selectedTaskEmployee}
                creator={selectedTaskCreator}
                isOpen={modalTaskId !== null}
                onClose={handleCloseModal}
            />
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
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`size-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[24px] ${c.icon}`}>{icon}</span>
            </div>
            <div>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                <p className="text-sm text-text-secondary font-medium">{label}</p>
            </div>
        </div>
    );
}
