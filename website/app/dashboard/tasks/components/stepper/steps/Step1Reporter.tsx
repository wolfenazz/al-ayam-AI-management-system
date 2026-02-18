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
        <div className="h-full flex flex-col p-6 sm:p-8">
            {/* Step Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-[24px] text-primary">person</span>
                    <h3 className="font-bold text-text-primary text-xl">Assign Reporter</h3>
                </div>
                <p className="text-base text-text-secondary">
                    Select a reporter to assign this task. You can search by name, role, or skills.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-5">
                <span className="material-symbols-outlined text-[22px] text-text-secondary absolute left-4 top-1/2 -translate-y-1/2">
                    search
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-border rounded-2xl text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
                    placeholder="Search reporters by name, role, or skills..."
                />
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-5 px-1">
                <div className="flex items-center gap-2.5 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-green"></span>
                    <span className="text-text-secondary">
                        <span className="font-semibold text-accent-green">{availableCount}</span> Available
                    </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-orange"></span>
                    <span className="text-text-secondary">
                        <span className="font-semibold text-accent-orange">
                            {activeEmployees.filter((e) => e.availability === 'BUSY').length}
                        </span> Busy
                    </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                    <span className="text-text-secondary">
                        <span className="font-semibold text-gray-500">
                            {activeEmployees.filter((e) => e.availability === 'OFF_DUTY').length}
                        </span> Off Duty
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {errors.assignee_id && (
                <div className="mb-5 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-red text-[20px]">error</span>
                    <span className="text-base text-accent-red">{errors.assignee_id}</span>
                </div>
            )}

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-border">
                                <div className="size-14 rounded-full bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="h-5 w-40 bg-gray-200 rounded-lg mb-2"></div>
                                    <div className="h-4 w-56 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-[56px] text-gray-300 mb-3 block">person_search</span>
                        <p className="text-text-secondary text-base">No reporters found</p>
                        <p className="text-text-secondary/70 text-sm mt-2">Try adjusting your search query</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredEmployees.map((emp) => {
                            const isSelected = selectedReporterId === emp.id;
                            const isOffDuty = emp.availability === 'OFF_DUTY';
                            
                            return (
                            <button
                                key={emp.id}
                                onClick={() => onReporterSelect(emp.id)}
                                disabled={isOffDuty}
                                className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left min-h-[84px] ${
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
                                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center ring-2 ring-white">
                                            <span className="material-symbols-outlined text-white text-[16px]">check</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="text-base font-bold text-text-primary">{emp.name}</span>
                                        {emp.performance_score && (
                                            <span className="text-sm text-accent-green font-bold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">star</span>
                                                {emp.performance_score}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary mt-0.5">{emp.role} • {emp.department}</p>

                                    {emp.skills && emp.skills.length > 0 && (
                                        <div className="hidden sm:flex gap-1.5 mt-2 flex-wrap">
                                            {emp.skills.slice(0, 3).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="text-[11px] px-2 py-0.5 bg-primary-light text-primary rounded-lg font-medium capitalize"
                                                >
                                                    {skill.replace(/_/g, ' ').toLowerCase()}
                                                </span>
                                            ))}
                                            {emp.skills.length > 3 && (
                                                <span className="text-[11px] px-2 py-0.5 bg-surface text-text-secondary rounded-lg font-medium">
                                                    +{emp.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Availability Badge */}
                                <div className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${
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
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-3 text-base text-accent-green">
                        <span className="material-symbols-outlined text-[22px]">check_circle</span>
                        <span className="font-medium">Reporter selected successfully</span>
                    </div>
                </div>
            )}
        </div>
    );
}
