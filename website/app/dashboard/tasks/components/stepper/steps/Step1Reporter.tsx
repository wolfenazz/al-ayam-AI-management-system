'use client';

import React, { useState, useMemo } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import Avatar from '@/components/ui/Avatar';
import { StepErrors } from '../hooks/useTaskForm';

// Memoized filter to prevent infinite re-renders
const ACTIVE_EMPLOYEE_FILTERS = { status: 'ACTIVE' as const };

interface Step1ReporterProps {
    selectedReporterId: string | null;
    onReporterSelect: (reporterId: string) => void;
    errors: StepErrors;
}

export default function Step1Reporter({
    selectedReporterId,
    onReporterSelect,
    errors,
}: Step1ReporterProps) {
    const { employees: activeEmployees, isLoading } = useEmployees(ACTIVE_EMPLOYEE_FILTERS);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return activeEmployees;
        
        const query = searchQuery.toLowerCase();
        return activeEmployees.filter((emp) =>
            emp.name.toLowerCase().includes(query) ||
            emp.role.toLowerCase().includes(query) ||
            emp.department?.toLowerCase().includes(query) ||
            emp.skills?.some((s) => s.toLowerCase().includes(query))
        );
    }, [activeEmployees, searchQuery]);

    const availableCount = activeEmployees.filter((e) => e.availability === 'AVAILABLE').length;

    return (
        <div className="h-full flex flex-col p-4 sm:p-6">
            {/* Step Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                    <h3 className="font-bold text-text-primary text-lg">Assign Reporter</h3>
                </div>
                <p className="text-sm text-text-secondary">
                    Select a reporter to assign this task. You can search by name, role, or skills.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <span className="material-symbols-outlined text-[20px] text-text-secondary absolute left-3 top-1/2 -translate-y-1/2">
                    search
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
                    placeholder="Search reporters by name, role, or skills..."
                />
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 px-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                    <span className="text-text-secondary">
                        <span className="font-semibold text-accent-green">{availableCount}</span> Available
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-accent-orange"></span>
                    <span className="text-text-secondary">
                        <span className="font-semibold text-accent-orange">
                            {activeEmployees.filter((e) => e.availability === 'BUSY').length}
                        </span> Busy
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span className="text-text-secondary">
                        <span className="font-semibold text-gray-500">
                            {activeEmployees.filter((e) => e.availability === 'OFF_DUTY').length}
                        </span> Off Duty
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {errors.assignee_id && (
                <div className="mb-4 bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-red text-[18px]">error</span>
                    <span className="text-sm text-accent-red">{errors.assignee_id}</span>
                </div>
            )}

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl border border-border">
                                <div className="size-12 rounded-full bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 w-48 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2 block">person_search</span>
                        <p className="text-text-secondary text-sm">No reporters found</p>
                        <p className="text-text-secondary/70 text-xs mt-1">Try adjusting your search query</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredEmployees.map((emp) => {
                            const isSelected = selectedReporterId === emp.id;
                            const isOffDuty = emp.availability === 'OFF_DUTY';
                            
                            return (
                            <button
                                key={emp.id}
                                onClick={() => onReporterSelect(emp.id)}
                                disabled={isOffDuty}
                                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left min-h-[72px] ${
                                    isSelected
                                        ? 'border-primary bg-primary-light shadow-sm'
                                        : 'border-border hover:border-text-secondary/30 bg-card'
                                } ${isOffDuty ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="relative shrink-0">
                                    <Avatar
                                        src={emp.avatar_url}
                                        alt={emp.name}
                                        size="lg"
                                        status={
                                            emp.availability === 'AVAILABLE'
                                                ? 'online'
                                                : emp.availability === 'BUSY'
                                                ? 'busy'
                                                : 'offline'
                                        }
                                    />
                                    {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center ring-2 ring-white">
                                            <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold text-text-primary">{emp.name}</span>
                                        {emp.performance_score && (
                                            <span className="text-xs text-accent-green font-bold flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[14px]">star</span>
                                                {emp.performance_score}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-secondary">{emp.role} • {emp.department}</p>

                                    {emp.skills && emp.skills.length > 0 && (
                                        <div className="hidden sm:flex gap-1 mt-1.5 flex-wrap">
                                            {emp.skills.slice(0, 3).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="text-[10px] px-1.5 py-0.5 bg-primary-light text-primary rounded font-medium capitalize"
                                                >
                                                    {skill.replace(/_/g, ' ').toLowerCase()}
                                                </span>
                                            ))}
                                            {emp.skills.length > 3 && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-surface text-text-secondary rounded font-medium">
                                                    +{emp.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Availability Badge */}
                                <div className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                                    emp.availability === 'AVAILABLE'
                                        ? 'bg-accent-green/10 text-accent-green'
                                        : emp.availability === 'BUSY'
                                        ? 'bg-accent-orange/10 text-accent-orange'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {emp.availability === 'AVAILABLE' ? 'Available' :
                                     emp.availability === 'BUSY' ? 'Busy' : 'Off Duty'}
                                </div>
                            </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Selected Reporter Summary */}
            {selectedReporterId && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-accent-green">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span className="font-medium">Reporter selected successfully</span>
                    </div>
                </div>
            )}
        </div>
    );
}
