'use client';

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Task } from '@/types/task';
import { Employee } from '@/types/employee';
import { Priority, TaskStatus } from '@/types/common';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';

interface TaskDetailModalProps {
    task: Task | null;
    employee?: Employee;
    creator?: Employee;
    isOpen: boolean;
    onClose: () => void;
}

const ReadOnlyMap = dynamic(() => import('./ReadOnlyMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-62.5 rounded-xl bg-surface border border-border flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                <span className="text-xs text-text-secondary">Loading map...</span>
            </div>
        </div>
    ),
});

function MapSection({ location, address, openMapsUrl, isOpen }: { location?: { lat: number; lng: number } | null; address?: string; openMapsUrl?: string | null; isOpen: boolean }) {
    // Small delay to ensure modal is rendered
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Small delay to allow modal animation to start/finish
            const timer = setTimeout(() => setShouldRender(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShouldRender(false);
        }
    }, [isOpen]);

    if (!location) {
        return (
            <div className="h-25 rounded-xl bg-surface border border-border flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[28px] text-text-secondary/50">location_off</span>
                <span className="text-xs text-text-secondary italic">No location set</span>
            </div>
        );
    }

    return (
        <div>
            {shouldRender ? (
                <ReadOnlyMap
                    location={location}
                    address={address}
                />
            ) : (
                <div className="w-full h-62.5 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                        <span className="text-xs text-text-secondary">Loading map...</span>
                    </div>
                </div>
            )}
            <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-text-secondary truncate flex-1 mr-2">
                    {address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                </p>
                {openMapsUrl && (
                    <a
                        href={openMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                        Open in Maps
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                )}
            </div>
        </div>
    );
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
    const urgent = diff < 4 * 60 * 60 * 1000;
    const overdue = diff < 0;

    if (task.start_time && task.end_time) {
        const date = new Date(task.deadline);
        const isToday = new Date().toDateString() === date.toDateString();
        const datePart = isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        text = `${datePart}, ${task.start_time} - ${task.end_time}`;
    } else {
        if (overdue) text = 'OVERDUE';
        else if (diff < 60 * 60 * 1000) text = `${Math.floor(diff / 60000)}m left`;
        else if (diff < 24 * 60 * 60 * 1000) text = 'Tomorrow';
        else text = `${Math.floor(diff / (24 * 3600000))}d left`;
    }

    return {
        text,
        urgent: urgent || overdue,
        icon: task.start_time ? 'schedule' : (urgent ? 'timer' : 'calendar_today')
    };
}

function formatTimeMinutes(minutes?: number): string {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatTimestamp(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${time}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${time}`;
}

function getTimelineEvents(task: Task) {
    const events: { status: string; timestamp?: string; icon: string }[] = [
        { status: 'Created', timestamp: task.created_at, icon: 'add_circle' },
    ];
    if (task.sent_at) events.push({ status: 'Sent', timestamp: task.sent_at, icon: 'send' });
    if (task.read_at) events.push({ status: 'Read', timestamp: task.read_at, icon: 'visibility' });
    if (task.accepted_at) events.push({ status: 'Accepted', timestamp: task.accepted_at, icon: 'check_circle' });
    if (task.started_at) events.push({ status: 'Started', timestamp: task.started_at, icon: 'play_circle' });
    if (task.completed_at) events.push({ status: 'Completed', timestamp: task.completed_at, icon: 'task_alt' });
    return events;
}

export default function TaskDetailModal({ task, employee, creator, isOpen, onClose }: TaskDetailModalProps) {
    const { setActiveChatTaskId } = useUIStore();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, handleKeyDown]);

    const scheduleInfo = task ? getScheduleDisplay(task) : null;
    const timelineEvents = task ? getTimelineEvents(task) : [];
    const deliverables = task?.deliverables || {};
    const notes = task?.notes || [];

    const openMapsUrl = useMemo(() => {
        if (!task?.location) return null;
        const { lat, lng } = task.location;
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }, [task?.location]);

    if (!isOpen || !task) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
                <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl overflow-hidden">
                    <div className={`w-full h-full ${priorityVariant[task.priority] === 'urgent' ? 'bg-red-500' :
                        priorityVariant[task.priority] === 'high' ? 'bg-orange-500' :
                            priorityVariant[task.priority] === 'normal' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                </div>

                <div className="p-6 pl-8 overflow-y-auto flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2.5 flex-wrap">
                            <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                            <Badge variant={statusVariant[task.status]}>{statusLabel[task.status]}</Badge>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-surface text-text-secondary hover:text-text-primary transition-colors shrink-0"
                            aria-label="Close modal"
                        >
                            <span className="material-symbols-outlined text-[22px]">close</span>
                        </button>
                    </div>

                    <h2 id="modal-title" className="text-xl font-bold text-text-primary mb-2">
                        {task.title}
                    </h2>

                    {task.type && (
                        <span className="inline-block text-[11px] px-2 py-0.5 bg-surface text-text-secondary rounded uppercase font-bold tracking-wider mb-4">
                            {task.type.replace('_', ' ')}
                        </span>
                    )}

                    <div className="mb-5">
                        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            Location
                        </h3>
                        <MapSection
                            key={task.id}
                            location={task.location}
                            address={task.location?.address}
                            openMapsUrl={openMapsUrl}
                            isOpen={isOpen}
                        />
                    </div>

                    <div className="mb-5">
                        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Description</h3>
                        <p className="text-sm text-text-primary leading-relaxed">
                            {task.description || 'No description provided for this task.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <InfoBox
                            icon={scheduleInfo?.icon || 'calendar_today'}
                            label="Schedule"
                            value={scheduleInfo?.text || 'Not scheduled'}
                            urgent={scheduleInfo?.urgent}
                        />

                        <div className="bg-surface rounded-xl p-3">
                            <div className="flex items-center gap-2 text-text-secondary mb-1.5">
                                <span className="material-symbols-outlined text-[14px]">person</span>
                                <span className="text-[10px] uppercase tracking-wide font-semibold">Assignee</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Avatar
                                    src={employee?.avatar_url}
                                    alt={employee?.name || 'Unassigned'}
                                    size="xs"
                                    status={getAvailabilityStatus(employee)}
                                />
                                <span className="text-xs font-medium text-text-primary truncate">
                                    {employee?.name || 'Unassigned'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-surface rounded-xl p-3">
                            <div className="flex items-center gap-2 text-text-secondary mb-1.5">
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                <span className="text-[10px] uppercase tracking-wide font-semibold">Creator</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Avatar
                                    src={creator?.avatar_url}
                                    alt={creator?.name || 'Unknown'}
                                    size="xs"
                                />
                                <span className="text-xs font-medium text-text-primary truncate">
                                    {creator?.name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {Object.keys(deliverables).length > 0 && (
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                Deliverables
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(deliverables).map(([key, count]) => (
                                    <span
                                        key={key}
                                        className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold"
                                    >
                                        {count}x {key.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {timelineEvents.length > 1 && (
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">timeline</span>
                                Timeline
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {timelineEvents.map((event, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-primary">{event.icon}</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-text-primary">{event.status}</span>
                                            <span className="text-[10px] text-text-secondary">{formatTimestamp(event.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(task.response_time || task.completion_time || task.quality_rating) && (
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">speed</span>
                                Performance
                            </h3>
                            <div className="flex gap-4">
                                {task.response_time !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-blue-500">bolt</span>
                                        <span className="text-xs text-text-secondary">Response:</span>
                                        <span className="text-xs font-semibold text-text-primary">{formatTimeMinutes(task.response_time)}</span>
                                    </div>
                                )}
                                {task.completion_time !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-green-500">timer</span>
                                        <span className="text-xs text-text-secondary">Completion:</span>
                                        <span className="text-xs font-semibold text-text-primary">{formatTimeMinutes(task.completion_time)}</span>
                                    </div>
                                )}
                                {task.quality_rating !== undefined && (
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                                        <span className="text-xs font-semibold text-text-primary">{task.quality_rating}/5</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {notes.length > 0 && (
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">sticky_note_2</span>
                                Notes ({notes.length})
                            </h3>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-surface rounded-lg p-2.5">
                                        <p className="text-xs text-text-primary mb-1">{note.content}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                                            <span className="font-medium">{note.author_name}</span>
                                            <span>•</span>
                                            <span>{formatTimestamp(note.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-surface mt-auto">
                        <button
                            onClick={() => {
                                onClose();
                                setActiveChatTaskId(task.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                            Open Chat
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-surface text-text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBox({
    icon,
    label,
    value,
    urgent,
}: {
    icon: string;
    label: string;
    value: string;
    urgent?: boolean;
}) {
    return (
        <div className="bg-surface rounded-xl p-3">
            <div className="flex items-center gap-2 text-text-secondary mb-1.5">
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
                <span className="text-xs uppercase tracking-wide font-semibold">{label}</span>
            </div>
            <p className={`text-sm font-medium ${urgent ? 'text-accent-red' : 'text-text-primary'}`}>
                {value}
            </p>
        </div>
    );
}
