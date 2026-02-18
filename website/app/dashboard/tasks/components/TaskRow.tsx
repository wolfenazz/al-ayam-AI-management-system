'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Employee } from '@/types/employee';
import { Priority, TaskStatus } from '@/types/common';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';

interface TaskRowProps {
    task: Task;
    employee?: Employee;
    isSelected: boolean;
    onSelect: (taskId: string) => void;
}

const priorityVariant: Record<Priority, 'urgent' | 'high' | 'normal' | 'low'> = {
    URGENT: 'urgent',
    HIGH: 'high',
    NORMAL: 'normal',
    LOW: 'low',
};

const statusLabel: Record<TaskStatus, string> = {
    DRAFT: 'DRAFT',
    SENT: 'TO DO',
    READ: 'READ',
    ACCEPTED: 'ACCEPTED',
    IN_PROGRESS: 'IN PROGRESS',
    REVIEW: 'REVIEW',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
};

const statusVariant: Record<TaskStatus, 'status' | 'neutral' | 'urgent' | 'normal'> = {
    DRAFT: 'neutral',
    SENT: 'neutral',
    READ: 'neutral',
    ACCEPTED: 'status',
    IN_PROGRESS: 'status',
    REVIEW: 'neutral',
    COMPLETED: 'normal',
    REJECTED: 'urgent',
    OVERDUE: 'urgent',
    CANCELLED: 'neutral',
};

function getAvailabilityStatus(emp?: Employee): 'online' | 'offline' | 'busy' | null {
    if (!emp) return null;
    if (emp.availability === 'AVAILABLE') return 'online';
    if (emp.availability === 'BUSY') return 'busy';
    return 'offline';
}

function getScheduleDisplay(task: Task): { text: string; urgent: boolean; icon: string } | null {
    if (!task.deadline) return null;
    const now = Date.now();
    const target = new Date(task.deadline).getTime();
    const diff = target - now;

    let text = '';
    const urgent = diff < 4 * 60 * 60 * 1000; // Less than 4 hours
    const overdue = diff < 0;

    if (task.start_time && task.end_time) {
        const date = new Date(task.deadline);
        const isToday = new Date().toDateString() === date.toDateString();
        const datePart = isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        text = `${datePart}, ${task.start_time} - ${task.end_time}`;
    } else {
        // Legacy/Fallback logic
        if (overdue) text = 'OVERDUE';
        else if (diff < 60 * 60 * 1000) text = `${Math.floor(diff / 60000)}m left`;
        else if (diff < 24 * 60 * 60 * 1000) text = 'Tomorrow'; // Approximate
        else text = `${Math.floor(diff / (24 * 3600000))}d left`;
    }

    return {
        text,
        urgent: urgent || overdue,
        icon: task.start_time ? 'schedule' : (urgent ? 'timer' : 'calendar_today')
    };
}

export default function TaskRow({ task, employee, isSelected, onSelect }: TaskRowProps) {
    const { setActiveChatTaskId } = useUIStore();
    const scheduleInfo = getScheduleDisplay(task);
    const showWhatsAppStrip = task.status === 'IN_PROGRESS' && task.priority === 'URGENT';

    return (
        <div
            className={`group bg-card rounded-2xl border transition-all flex flex-col mb-1.5 ${isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-text-secondary/20 shadow-sm'
                }`}
        >
            <div className="flex items-center p-5 gap-5">
                {/* Checkbox */}
                <div className="flex items-center justify-center shrink-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(task.id)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                </div>

                {/* Priority Indicator Line */}
                <div className={`w-1.5 h-14 rounded-full shrink-0 ${task.priority === 'URGENT' ? 'bg-red-500' :
                    task.priority === 'HIGH' ? 'bg-orange-500' :
                        task.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />

                {/* Task Info */}
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-5 items-center">
                    {/* Title & Type (Col 1-5) */}
                    <div className="col-span-5">
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <h3 className="font-bold text-text-primary truncate text-base">{task.title}</h3>
                            {task.type && (
                                <span className="text-[11px] px-2 py-0.5 bg-surface text-text-secondary rounded uppercase font-bold tracking-wider">
                                    {task.type.replace('_', ' ')}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary truncate">{task.description || 'No description'}</p>
                    </div>

                    {/* Status & Priority (Col 6-8) */}
                    <div className="col-span-3 flex flex-wrap gap-2.5 items-center">
                        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                        <Badge variant={statusVariant[task.status]}>{statusLabel[task.status]}</Badge>
                    </div>

                    {/* Assignee (Col 9-10) */}
                    <div className="col-span-2 flex items-center gap-2.5 overflow-hidden">
                        {employee ? (
                            <>
                                <Avatar
                                    src={employee.avatar_url}
                                    alt={employee.name}
                                    size="xs"
                                    status={getAvailabilityStatus(employee)}
                                />
                                <span className="text-sm text-text-primary truncate">{employee.name.split(' ')[0]}</span>
                            </>
                        ) : (
                            <span className="text-sm text-text-secondary italic">Unassigned</span>
                        )}
                    </div>

                    {/* Deadline (Col 11-12) */}
                    <div className="col-span-2 flex justify-end">
                        {scheduleInfo && (
                            <div className={`flex items-center gap-1.5 font-medium text-sm px-3 py-1.5 rounded-lg whitespace-nowrap ${scheduleInfo.urgent ? 'text-accent-red bg-accent-red/5' : 'text-text-secondary bg-surface'
                                }`}>
                                <span className="material-symbols-outlined text-[16px]">
                                    {scheduleInfo.icon}
                                </span>
                                <span>{scheduleInfo.text}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center pl-3 border-l border-border shrink-0 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveChatTaskId(task.id); }}
                        className="p-2 hover:bg-surface rounded-lg text-text-secondary hover:text-primary transition-colors"
                        title="Chat"
                    >
                        <span className="material-symbols-outlined text-[22px]">chat</span>
                    </button>
                    <button
                        className="p-2 hover:bg-surface rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[22px]">more_vert</span>
                    </button>
                </div>
            </div>

            {/* WhatsApp Integration Strip (Condensed for Row) */}
            {showWhatsAppStrip && (
                <div className="bg-green-50 px-14 py-2 flex items-center justify-between gap-3 text-sm border-t border-green-100 rounded-b-2xl mx-1 mb-1">
                    <div className="flex items-center gap-2.5">
                        <span className="text-green-700 font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">whatsapp</span>
                            New Update
                        </span>
                        <span className="text-green-800/70 truncate max-w-[400px]">"Photos coming in 2 mins, uploading now..."</span>
                    </div>
                    <button
                        onClick={() => setActiveChatTaskId(task.id)}
                        className="font-bold text-green-700 hover:text-green-900 hover:underline px-2 py-1 rounded hover:bg-green-100 transition-colors"
                    >
                        View
                    </button>
                </div>
            )}
        </div>
    );
}
