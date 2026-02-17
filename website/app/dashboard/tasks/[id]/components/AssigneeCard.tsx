'use client';

import React from 'react';
import { useEmployee } from '@/hooks/useEmployees';
import Avatar from '@/components/ui/Avatar';

interface AssigneeCardProps {
    assigneeId?: string;
    onChange: () => void;
}

export default function AssigneeCard({ assigneeId, onChange }: AssigneeCardProps) {
    const { employee, isLoading } = useEmployee(assigneeId || null);

    return (
        <div className="p-6 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Assigned To</h3>
                <button
                    onClick={onChange}
                    className="text-sm text-primary hover:text-primary-dark font-medium px-2 py-1 hover:bg-primary/5 rounded transition-colors"
                >
                    change
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                </div>
            ) : employee ? (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={employee.avatar_url}
                        alt={employee.name}
                        size="md"
                        status={employee.availability === 'AVAILABLE' ? 'online' : employee.availability === 'BUSY' ? 'busy' : 'offline'}
                    />
                    <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.role} • {employee.department}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 mb-2">No one assigned yet</p>
                    <button
                        onClick={onChange}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Assign now
                    </button>
                </div>
            )}
        </div>
    );
}
