'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { TaskStatus, Priority } from '@/types/common';
import { mockTasks } from '@/lib/mock-data';

const statusOptions: { label: string; value: TaskStatus; count: number }[] = [
    { label: 'In Progress', value: 'IN_PROGRESS', count: mockTasks.filter((t) => t.status === 'IN_PROGRESS').length },
    { label: 'To Do', value: 'SENT', count: mockTasks.filter((t) => t.status === 'SENT' || t.status === 'DRAFT').length },
    { label: 'In Review', value: 'REVIEW', count: mockTasks.filter((t) => t.status === 'REVIEW').length },
];

const priorityOptions: { label: string; value: Priority; color: string }[] = [
    { label: 'Urgent', value: 'URGENT', color: 'bg-accent-red' },
    { label: 'High', value: 'HIGH', color: 'bg-accent-orange' },
    { label: 'Normal', value: 'NORMAL', color: 'bg-accent-green' },
];

const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
    { href: '/dashboard/tasks', icon: 'assignment', label: 'Tasks', exact: false },
    { href: '/dashboard/analytics', icon: 'bar_chart', label: 'Analytics', exact: false },
];

export default function Sidebar() {
    const pathname = usePathname();
    const {
        sidebarOpen,
        statusFilters,
        toggleStatusFilter,
        priorityFilters,
        togglePriorityFilter,
        setCreateTaskModalOpen,
        setSidebarOpen,
    } = useUIStore();

    const isTasksPage = pathname === '/dashboard/tasks';

    const isActive = (item: typeof navItems[0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
          w-64 bg-white border-r border-border flex-col overflow-y-auto shrink-0 z-30
          transition-transform duration-300 ease-in-out
          fixed md:relative md:translate-x-0 h-full
          ${sidebarOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex md:translate-x-0'}
        `}
            >
                {/* New Task Button */}
                <div className="p-6">
                    <button
                        onClick={() => setCreateTaskModalOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg h-10 bg-primary hover:bg-primary/90 transition-all text-white text-sm font-bold shadow-md shadow-primary/20 active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>New Task</span>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-1 px-4 pb-4">
                    <p className="px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-2">
                        Navigation
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${isActive(item)
                                ? 'bg-primary-light text-primary font-medium'
                                : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                            {item.label === 'Tasks' && (
                                <span className="ml-auto text-xs bg-border px-1.5 py-0.5 rounded text-text-secondary">
                                    {mockTasks.length}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Task Filters — only show on tasks page */}
                {isTasksPage && (
                    <>
                        <div className="border-t border-border mx-4 my-2" />

                        {/* Status Filters */}
                        <div className="flex flex-col gap-1 px-4">
                            <p className="px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-4">
                                Status
                            </p>
                            {statusOptions.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-3 px-3 py-1.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={statusFilters.includes(opt.value)}
                                        onChange={() => toggleStatusFilter(opt.value)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary/20 w-4 h-4"
                                    />
                                    <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                                        {opt.label}
                                    </span>
                                    <span className="ml-auto text-xs text-text-secondary">{opt.count}</span>
                                </label>
                            ))}
                        </div>

                        {/* Priority Filters */}
                        <div className="flex flex-col gap-1 px-4 mt-2">
                            <p className="px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-4">
                                Priority
                            </p>
                            {priorityOptions.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-3 px-3 py-1.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={priorityFilters.includes(opt.value)}
                                        onChange={() => togglePriorityFilter(opt.value)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary/20 w-4 h-4"
                                    />
                                    <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                                        {opt.label}
                                    </span>
                                    <span className={`ml-auto w-2 h-2 rounded-full ${opt.color}`} />
                                </label>
                            ))}
                        </div>
                    </>
                )}

                {/* Footer Info */}
                <div className="mt-auto p-4 border-t border-border">
                    <div className="flex items-center gap-2 text-text-secondary">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        <span className="text-xs">WhatsApp API Connected</span>
                        <span className="w-2 h-2 rounded-full bg-accent-green ml-auto" />
                    </div>
                </div>
            </aside>
        </>
    );
}
