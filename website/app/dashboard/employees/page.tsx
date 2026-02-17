'use client';

import React, { useState } from 'react';
import { useEmployees, useEmployeeStats } from '@/hooks/useEmployees';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

export default function EmployeesPage() {
    const { employees, isLoading } = useEmployees();
    const stats = useEmployeeStats(employees);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary mb-1">
                            Team Management
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Manage your newsroom staff and view their current status.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-border shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'text-primary bg-primary-light' : 'hover:bg-surface text-text-secondary'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'text-primary bg-primary-light' : 'hover:bg-surface text-text-secondary'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">view_list</span>
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 shadow-sm animate-pulse">
                                <div className="size-10 bg-gray-200 rounded-lg" />
                                <div>
                                    <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
                                    <div className="h-3 w-16 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <StatCard
                                icon="group"
                                label="Total Staff"
                                value={stats.total.toString()}
                                color="primary"
                            />
                            <StatCard
                                icon="check_circle"
                                label="Available"
                                value={stats.available.toString()}
                                color="green"
                            />
                            <StatCard
                                icon="hourglass_top"
                                label="Busy"
                                value={stats.busy.toString()}
                                color="red"
                            />
                            <StatCard
                                icon="do_not_disturb_on"
                                label="Off Duty"
                                value={stats.offDuty.toString()}
                                color="gray"
                            />
                        </>
                    )}
                </div>

                {/* Employees Content */}
                {isLoading ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-2'}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border p-6 shadow-sm animate-pulse h-64">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 mx-auto" />
                                <div className="h-4 w-1/2 bg-gray-100 rounded mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="bg-white rounded-xl border border-border p-12 text-center shadow-sm">
                        <span className="material-symbols-outlined text-[64px] text-gray-300 mb-3 block">group_off</span>
                        <p className="text-lg font-semibold text-text-primary mb-1">No employees found</p>
                        <p className="text-sm text-text-secondary">Add employees to your team to see them here.</p>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                : 'flex flex-col gap-2'
                        }
                    >
                        {employees.map((employee) => (
                            viewMode === 'grid' ? (
                                <EmployeeCard key={employee.id} employee={employee} />
                            ) : (
                                <EmployeeRow key={employee.id} employee={employee} />
                            )
                        ))}
                    </div>
                )}
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
    color: 'primary' | 'green' | 'red' | 'gray';
}) {
    const colorMap = {
        primary: { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600' },
        red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
        gray: { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-500' },
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

function EmployeeCard({ employee }: { employee: any }) {
    const statusColor =
        employee.availability === 'AVAILABLE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
            employee.availability === 'BUSY' ? 'text-red-600 bg-red-50 border-red-100' :
                'text-gray-500 bg-gray-50 border-gray-100';

    return (
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group relative overflow-hidden">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
            </div>

            <div className="mb-4 relative inline-block">
                <Avatar
                    src={employee.avatar_url}
                    alt={employee.name}
                    size="xl"
                    className="ring-4 ring-gray-50"
                />
                <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white ${employee.availability === 'AVAILABLE' ? 'bg-emerald-500' :
                    employee.availability === 'BUSY' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
            </div>

            <h3 className="font-bold text-text-primary text-lg mb-1">{employee.name}</h3>
            <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded mb-3 tracking-wide uppercase">
                {employee.role?.replace('_', ' ')}
            </span>

            <div className={`text-xs px-2.5 py-1 rounded-full border font-medium mb-4 ${statusColor}`}>
                {employee.availability?.replace('_', ' ')}
            </div>

            <div className="w-full border-t border-gray-100 pt-4 mt-auto flex justify-between px-2 text-text-secondary text-sm">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary">{employee.performance_score || 'N/A'}</span>
                    <span className="text-[10px] uppercase">Score</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary">{employee.completed_tasks || 0}</span>
                    <span className="text-[10px] uppercase">Tasks</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary">{employee.monthly_score || 'N/A'}</span>
                    <span className="text-[10px] uppercase">Month</span>
                </div>
            </div>
        </div>
    );
}

function EmployeeRow({ employee }: { employee: any }) {
    return (
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
            <Avatar
                src={employee.avatar_url}
                alt={employee.name}
                size="md"
                status={
                    employee.availability === 'AVAILABLE' ? 'online' :
                        employee.availability === 'BUSY' ? 'busy' : 'offline'
                }
            />

            <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                    <h3 className="font-bold text-text-primary truncate">{employee.name}</h3>
                    <p className="text-xs text-text-secondary truncate">{employee.email}</p>
                </div>

                <div className="col-span-3">
                    <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded tracking-wide uppercase">
                        {employee.role?.replace('_', ' ')}
                    </span>
                </div>

                <div className="col-span-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${employee.availability === 'AVAILABLE' ? 'text-emerald-700 bg-emerald-50' :
                        employee.availability === 'BUSY' ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-100'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${employee.availability === 'AVAILABLE' ? 'bg-emerald-500' :
                            employee.availability === 'BUSY' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                        {employee.availability?.replace('_', ' ')}
                    </div>
                </div>

                <div className="col-span-2 text-right text-sm font-bold text-text-primary">
                    {employee.performance_score || 'N/A'} <span className="text-[10px] text-text-secondary font-normal uppercase ml-1">Score</span>
                </div>
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
        </div>
    )
}
