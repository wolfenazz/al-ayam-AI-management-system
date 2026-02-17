'use client';

import React from 'react';
import { Priority } from '@/types/common';
import { StepErrors } from '../hooks/useTaskForm';

interface Step3PriorityScheduleProps {
    priority: Priority;
    deadlineDate: string;
    startTime: string;
    endTime: string;
    onPriorityChange: (priority: Priority) => void;
    onDeadlineDateChange: (date: string) => void;
    onStartTimeChange: (time: string) => void;
    onEndTimeChange: (time: string) => void;
    errors: StepErrors;
}

const priorityOptions: {
    value: Priority;
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
}[] = [
    {
        value: 'URGENT',
        label: 'Urgent',
        icon: 'priority_high',
        color: 'text-accent-red',
        bgColor: 'bg-accent-red/10',
        borderColor: 'border-accent-red',
        description: 'Immediate action required',
    },
    {
        value: 'HIGH',
        label: 'High',
        icon: 'arrow_upward',
        color: 'text-accent-orange',
        bgColor: 'bg-accent-orange/10',
        borderColor: 'border-accent-orange',
        description: 'Complete within hours',
    },
    {
        value: 'NORMAL',
        label: 'Normal',
        icon: 'remove',
        color: 'text-accent-green',
        bgColor: 'bg-accent-green/10',
        borderColor: 'border-accent-green',
        description: 'Standard timeline',
    },
    {
        value: 'LOW',
        label: 'Low',
        icon: 'arrow_downward',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        description: 'Flexible timeline',
    },
];

export default function Step3PrioritySchedule({
    priority,
    deadlineDate,
    startTime,
    endTime,
    onPriorityChange,
    onDeadlineDateChange,
    onStartTimeChange,
    onEndTimeChange,
    errors,
}: Step3PriorityScheduleProps) {
    // Get today's date for min date validation
    const today = new Date().toISOString().split('T')[0];
    
    // Format date for display
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return 'Select date';
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const todayDate = new Date();
        const isToday = 
            todayDate.getFullYear() === y && 
            todayDate.getMonth() === m - 1 && 
            todayDate.getDate() === d;
        
        return isToday 
            ? 'Today' 
            : date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6">
            {/* Step Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
                    <h3 className="font-bold text-text-primary text-lg">Priority & Schedule</h3>
                </div>
                <p className="text-sm text-text-secondary">
                    Set the task priority level and schedule the deadline.
                </p>
            </div>

            {/* Priority Selection */}
            <div className="mb-8">
                <label className="block text-xs font-semibold text-text-secondary mb-3">
                    Priority Level <span className="text-accent-red">*</span>
                </label>
                
                {errors.priority && (
                    <div className="mb-3 bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent-red text-[18px]">error</span>
                        <span className="text-sm text-accent-red">{errors.priority}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {priorityOptions.map((opt) => {
                        const isSelected = priority === opt.value;

                        return (
                            <button
                                key={opt.value}
                                onClick={() => onPriorityChange(opt.value)}
                                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left min-h-[64px] ${
                                    isSelected
                                        ? `${opt.bgColor} ${opt.borderColor} shadow-sm`
                                        : 'border-border hover:border-text-secondary/30 bg-card'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? opt.bgColor : 'bg-surface'
                                }`}>
                                    <span className={`material-symbols-outlined text-[22px] ${
                                        isSelected ? opt.color : 'text-text-secondary'
                                    }`}>
                                        {opt.icon}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${
                                        isSelected ? opt.color : 'text-text-primary'
                                    }`}>
                                        {opt.label}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-0.5 hidden sm:block">
                                        {opt.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <span className={`material-symbols-outlined ${opt.color} text-[18px] shrink-0`}>
                                        check_circle
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Schedule Section */}
            <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-3">
                    Task Schedule <span className="text-accent-red">*</span>
                </label>

                {/* Date Picker */}
                <div className="mb-4">
                    <label className="block text-xs text-text-secondary mb-2">Deadline Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={deadlineDate}
                            onChange={(e) => onDeadlineDateChange(e.target.value)}
                            min={today}
                            className={`w-full px-4 py-3 border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-background ${
                                errors.deadlineDate ? 'border-accent-red' : 'border-border focus:border-primary'
                            }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="material-symbols-outlined text-text-secondary text-[20px]">calendar_today</span>
                        </div>
                    </div>
                    {errors.deadlineDate && (
                        <p className="text-xs text-accent-red mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.deadlineDate}
                        </p>
                    )}
                    {deadlineDate && (
                        <p className="text-xs text-text-secondary mt-1">
                            Selected: {formatDisplayDate(deadlineDate)}
                        </p>
                    )}
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-text-secondary mb-2">Start Time</label>
                        <div className="relative">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => onStartTimeChange(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-background ${
                                    errors.startTime ? 'border-accent-red' : 'border-border focus:border-primary'
                                }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-text-secondary text-[18px]">schedule</span>
                            </div>
                        </div>
                        {errors.startTime && (
                            <p className="text-xs text-accent-red mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {errors.startTime}
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-xs text-text-secondary mb-2">End Time</label>
                        <div className="relative">
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => onEndTimeChange(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-background ${
                                    errors.endTime ? 'border-accent-red' : 'border-border focus:border-primary'
                                }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-text-secondary text-[18px]">schedule</span>
                            </div>
                        </div>
                        {errors.endTime && (
                            <p className="text-xs text-accent-red mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {errors.endTime}
                            </p>
                        )}
                    </div>
                </div>

                {/* Duration Display */}
                {startTime && endTime && (
                    <div className="mt-4 p-3 bg-surface rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">timer</span>
                        <span className="text-sm text-text-secondary">
                            Duration: {(() => {
                                const [startH, startM] = startTime.split(':').map(Number);
                                const [endH, endM] = endTime.split(':').map(Number);
                                const startMinutes = startH * 60 + startM;
                                const endMinutes = endH * 60 + endM;
                                const diff = endMinutes - startMinutes;
                                
                                if (diff < 0) return 'Invalid time range';
                                
                                const hours = Math.floor(diff / 60);
                                const minutes = diff % 60;
                                
                                if (hours === 0) return `${minutes} minutes`;
                                if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
                                return `${hours}h ${minutes}m`;
                            })()}
                        </span>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                            priorityOptions.find((p) => p.value === priority)?.bgColor || 'bg-surface'
                        }`}>
                            <span className={`material-symbols-outlined text-[18px] ${
                                priorityOptions.find((p) => p.value === priority)?.color || 'text-text-secondary'
                            }`}>
                                {priorityOptions.find((p) => p.value === priority)?.icon || 'schedule'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Priority</p>
                            <p className="text-sm font-semibold text-text-primary">
                                {priorityOptions.find((p) => p.value === priority)?.label || 'Select priority'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[18px]">event</span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Schedule</p>
                            <p className="text-sm font-semibold text-text-primary">
                                {formatDisplayDate(deadlineDate)} • {startTime || '09:00'} - {endTime || '17:00'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
