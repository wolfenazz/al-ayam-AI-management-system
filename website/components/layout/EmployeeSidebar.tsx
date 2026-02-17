'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useTasks, useTaskStats } from '@/hooks/useTasks';
import { useAuth } from '@/lib/auth/AuthContext';

export default function EmployeeSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    // We can filter tasks by assignee to show count? 
    // useTasks hook fetches all tasks by default unless filtered. 
    // Ideally we should have a hook that only fetches my tasks for performance, 
    // but for now we can filter client side or use the hook with filter if supported.
    // The useTasks hook supports filters.

    const { tasks } = useTasks();
    // Filter tasks for this user to show counts
    const myTasks = tasks.filter(t => t.assignee_id === user?.uid);
    const stats = useTaskStats(myTasks);

    const {
        sidebarOpen,
        setSidebarOpen,
    } = useUIStore();

    const navItems = [
        { href: '/employees-dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
        { href: '/employees-dashboard/tasks', icon: 'assignment', label: 'My Tasks', exact: false },
        { href: '/employees-dashboard/analytics', icon: 'bar_chart', label: 'My Stats', exact: false },
        { href: '/employees-dashboard/profile', icon: 'person', label: 'Profile', exact: false },
    ];

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
                {/* Navigation */}
                <div className="flex flex-col gap-1 px-4 py-6">
                    <p className="px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Menu
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
                            {item.label === 'My Tasks' && stats.inProgress > 0 && (
                                <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                    {stats.inProgress}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-auto p-4 border-t border-border">
                    <div className="flex items-center gap-2 text-text-secondary">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        <span className="text-xs">Employee Portal</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
