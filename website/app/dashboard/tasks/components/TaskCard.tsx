'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Employee } from '@/types/employee';
import { Priority, TaskStatus } from '@/types/common';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';

interface TaskCardProps {
    task: Task;
    employee?: Employee;
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

export default function TaskCard({ task, employee }: TaskCardProps) {
    const { setActiveChatTaskId } = useUIStore();
    const scheduleInfo = getScheduleDisplay(task);

    // Show WhatsApp strip for in-progress tasks
    const showWhatsAppStrip = task.status === 'IN_PROGRESS' && task.priority === 'URGENT';

    return (
        <div className="task-card bg-white rounded-xl border border-border shadow-sm flex flex-col animate-fade-in">
            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* ... (rest of the card content) ... */}

                {/* Footer: Assignee & Deadline */}
                <div className="mt-auto pt-4 border-t border-surface flex items-center justify-between">
                    {employee ? (
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={employee.avatar_url}
                                alt={employee.name}
                                size="sm"
                                status={getAvailabilityStatus(employee)}
                            />
                            <div className="flex flex-col">
                                <span className="text-xs text-text-secondary">Assignee</span>
                                <span className="text-sm font-medium text-text-primary">{employee.name}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px] text-text-secondary">person_add</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-text-secondary">Assignee</span>
                                <span className="text-sm font-medium text-text-secondary italic">Unassigned</span>
                            </div>
                        </div>
                    )}

                    {scheduleInfo && (
                        <div
                            className={`flex items-center gap-1 font-medium text-xs px-2 py-1 rounded ${scheduleInfo.urgent
                                ? 'text-accent-red bg-accent-red/5'
                                : 'text-text-secondary bg-border'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[14px]">
                                {scheduleInfo.icon}
                            </span>
                            <span>{scheduleInfo.text}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* WhatsApp Integration Strip */}
            {showWhatsAppStrip && (
                <div className="bg-green-50 px-5 py-3 rounded-b-xl border-t border-green-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-6 h-6 rounded bg-whatsapp flex items-center justify-center text-white shrink-0">
                            <svg fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-xs font-semibold text-green-800">New message from Field Team</p>
                            <p className="text-xs text-green-700/80 truncate">&quot;Photos coming in 2 mins, uploading now...&quot;</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveChatTaskId(task.id)}
                        className="text-xs font-bold text-green-700 hover:text-green-900 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors whitespace-nowrap"
                    >
                        Open Chat
                    </button>
                </div>
            )}
        </div>
    );
}
