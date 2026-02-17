'use client';

import React, { useState } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import Avatar from '@/components/ui/Avatar';

interface AssignTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAssigneeId?: string;
    onAssign: (employeeId: string) => void;
    isAssigning?: boolean;
}

export default function AssignTaskModal({ isOpen, onClose, currentAssigneeId, onAssign, isAssigning = false }: AssignTaskModalProps) {
    const [search, setSearch] = useState('');
    const { employees, isLoading } = useEmployees({ status: 'ACTIVE' });
    const [selectedId, setSelectedId] = useState<string | null>(currentAssigneeId || null);

    if (!isOpen) return null;

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase()) ||
        e.department?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAssign = () => {
        if (selectedId) {
            onAssign(selectedId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
                {/* Header */}
                <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Assign Task</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search by name, role, or department..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                            <span className="text-sm">Loading employees...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-sm">
                            No employees found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map(emp => {
                                const isSelected = selectedId === emp.id;
                                return (
                                    <button
                                        key={emp.id}
                                        onClick={() => setSelectedId(emp.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${isSelected
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                    >
                                        <Avatar
                                            src={emp.avatar_url}
                                            alt={emp.name}
                                            size="md"
                                            status={emp.availability === 'AVAILABLE' ? 'online' : emp.availability === 'BUSY' ? 'busy' : 'offline'}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`font-medium text-sm truncate ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                                                    {emp.name}
                                                </p>
                                                {isSelected && (
                                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                {emp.role} {emp.department && `• ${emp.department}`}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedId || isAssigning || selectedId === currentAssigneeId}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        {isAssigning ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Assigning...</span>
                            </>
                        ) : (
                            'Confirm task'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
