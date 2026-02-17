'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useTask } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { Task } from '@/types/task';

// ─── Reply Type ──────────────────────────────────────────────────

interface ChatReply {
    content: string;
    direction: 'inbound' | 'outbound';
    time: string;
}

// ─── Generate contextual reporter replies based on task data ─────

function generateReporterReplies(task: Task, reporterName: string): ChatReply[] {
    const replies: ChatReply[] = [];
    const baseTime = task.sent_at ? new Date(task.sent_at) : new Date(task.created_at);

    const addMinutes = (date: Date, min: number) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() + min);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const taskType = task.type?.replace(/_/g, ' ').toLowerCase() || 'task';
    const locationText = task.location?.address || 'the location';

    // 1. Reporter acknowledges receiving the task
    if (task.read_at || task.accepted_at || task.started_at || task.completed_at ||
        task.status === 'ACCEPTED' || task.status === 'IN_PROGRESS' || task.status === 'COMPLETED') {
        replies.push({
            content: `Got it! I'll take care of the ${taskType}. 👍`,
            direction: 'inbound',
            time: addMinutes(baseTime, 2),
        });
    }

    // 2. Reporter confirms acceptance
    if (task.accepted_at || task.status === 'ACCEPTED' || task.status === 'IN_PROGRESS' || task.status === 'COMPLETED') {
        replies.push({
            content: task.location
                ? `I'm heading to ${locationText} now. Will update you as soon as I arrive.`
                : `I'm on it. Will start working on this right away.`,
            direction: 'inbound',
            time: addMinutes(baseTime, 5),
        });

        // Editor/manager response
        replies.push({
            content: task.priority === 'URGENT'
                ? 'Great, this is urgent so please prioritize it. Stay safe! 🙏'
                : 'Perfect, keep me updated on the progress.',
            direction: 'outbound',
            time: addMinutes(baseTime, 6),
        });
    }

    // 3. Reporter starts working
    if (task.started_at || task.status === 'IN_PROGRESS' || task.status === 'COMPLETED') {
        replies.push({
            content: task.location
                ? `I've arrived at ${locationText}. Setting up now. 📍`
                : `Started working on the ${taskType}. Making progress.`,
            direction: 'inbound',
            time: addMinutes(baseTime, 25),
        });

        // If deliverables are required, reporter mentions them
        if (task.deliverables && Object.keys(task.deliverables).length > 0) {
            const deliverablesList = Object.entries(task.deliverables)
                .map(([key, count]) => `${count} ${key.replace(/_/g, ' ')}`)
                .join(', ');
            replies.push({
                content: `I'll make sure to get the ${deliverablesList} as required. 📸`,
                direction: 'inbound',
                time: addMinutes(baseTime, 28),
            });
        }
    }

    // 4. Task completed
    if (task.completed_at || task.status === 'COMPLETED') {
        replies.push({
            content: `All done! ✅ I've completed the ${taskType} and uploaded all the deliverables. Please review when you get a chance.`,
            direction: 'inbound',
            time: addMinutes(baseTime, 90),
        });

        replies.push({
            content: 'Excellent work! Reviewing now. Thank you! 🎉',
            direction: 'outbound',
            time: addMinutes(baseTime, 95),
        });
    }

    // 5. If task is still pending/sent — show a "seen" but no reply yet
    if (task.status === 'DRAFT' || task.status === 'SENT') {
        // No replies yet, task was just sent
    }

    return replies;
}

export default function WhatsAppPanel() {
    const { activeChatTaskId } = useUIStore(); // Get selected task ID
    const { task, isLoading: taskLoading } = useTask(activeChatTaskId);
    const { employees } = useEmployees();

    const [messageInput, setMessageInput] = useState('');
    const [sentMessages, setSentMessages] = useState<ChatReply[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const assignee = task?.assignee_id ? employees.find(e => e.id === task.assignee_id) : (task?.creator_id ? employees.find(e => e.id === task.creator_id) : null);

    // Generate contextual reporter replies based on the task
    const reporterReplies = useMemo(() => {
        if (!task) return [];
        return generateReporterReplies(task, assignee?.name || 'Reporter');
    }, [task, assignee]);

    // Handle Invalid Date fallback
    const getValidDate = (dateString?: string) => {
        if (!dateString) return new Date();
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    // Reset sent messages when switching tasks
    useEffect(() => {
        setSentMessages([]);
        setMessageInput('');
    }, [activeChatTaskId]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [reporterReplies.length, sentMessages.length, activeChatTaskId]);

    const handleSend = () => {
        const text = messageInput.trim();
        if (!text) return;

        const now = new Date();
        const newMsg: ChatReply = {
            content: text,
            direction: 'outbound',
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSentMessages(prev => [...prev, newMsg]);
        setMessageInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };


    // 1. Empty State: No Task Selected
    if (!activeChatTaskId) {
        return (
            <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center text-center p-6 overflow-hidden bg-[#f0f2f5]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-[40px] text-gray-300">chat_bubble_outline</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Chat Selected</h3>
                <p className="text-sm text-gray-500">
                    Select a task from the list to view the conversation with the reporter.
                </p>
                <div className="mt-8 border-t border-gray-200 pt-6 w-full max-w-[200px]">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        <span className="text-xs">End-to-end encrypted</span>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Loading State
    if (taskLoading) {
        return (
            <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // 3. Active Chat View - Same pattern as CreateTaskModal (which works)
    return (
        <div className="w-full flex-1 min-h-0 flex flex-col bg-white overflow-hidden">
            {/* Header - shrink-0 keeps it pinned at top */}
            <div className="bg-primary flex items-center justify-between px-3 pt-9 pb-2 text-white shadow-md z-30 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer">
                        <div className="size-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-white/20">
                            {assignee?.avatar_url ? (
                                <img
                                    className="w-full h-full object-cover"
                                    src={assignee.avatar_url}
                                    alt={assignee.name}
                                />
                            ) : (
                                <div className="w-full h-full text-white font-bold flex items-center justify-center">
                                    {(assignee?.name || 'R')[0]}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-primary"></div>
                    </div>
                    <div>
                        <div className="font-bold text-xs">{assignee?.name || 'Reporter'}</div>
                        <div className="text-[10px] text-white/80">Online</div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="hover:bg-white/10 rounded-full p-1.5 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">videocam</span>
                    </button>
                    <button className="hover:bg-white/10 rounded-full p-1.5 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">call</span>
                    </button>
                    <button className="hover:bg-white/10 rounded-full p-1.5 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                </div>
            </div>

            {/* Chat Area - flex-1 fills all remaining space between header and input */}
            <div className="flex-1 overflow-y-auto p-3 chat-bg flex flex-col gap-3 scrollbar-thin w-full pb-4">
                {/* Encryption Notice */}
                <div className="flex justify-center my-1">
                    <div className="bg-[#ffeba0] text-gray-800 text-[10px] px-2 py-1 rounded shadow-sm text-center max-w-[85%] flex items-center gap-1 justify-center">
                        <span className="material-symbols-outlined text-[10px]">lock</span>
                        Messages are end-to-end encrypted.
                    </div>
                </div>

                {/* Date divider */}
                <div className="flex justify-center my-1">
                    <span className="bg-white/90 text-text-secondary text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {task?.created_at
                            ? (() => {
                                const d = getValidDate(task.created_at);
                                const today = new Date();
                                return d.toDateString() === today.toDateString()
                                    ? 'TODAY'
                                    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
                            })()
                            : 'TODAY'}
                    </span>
                </div>

                {/* Task Assignment Message — the task sent to the reporter */}
                {task && (
                    <div className="flex flex-col items-end self-end max-w-[90%] animate-fade-in">
                        <div className="bg-[#d9fdd3] p-2.5 rounded-lg rounded-tr-none shadow-sm text-xs border border-[#d9fdd3]">
                            <p className="font-bold text-accent-red text-[11px] mb-1">🚨 New Task: {task.title}</p>
                            <p className="text-text-primary leading-relaxed mb-2 text-[11px]">
                                {task.description || 'No description provided.'}
                            </p>
                            <div className="flex flex-col gap-0.5 text-[10px] text-text-secondary">
                                {(task.deadline || task.start_time) && (
                                    <span>
                                        ⏰ Schedule:{' '}
                                        {(() => {
                                            if (!task.deadline) return 'No Date';
                                            const d = getValidDate(task.deadline);
                                            const today = new Date();
                                            const isToday = d.toDateString() === today.toDateString();
                                            const datePart = isToday
                                                ? 'Today'
                                                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
                                            return `${datePart}, ${task.start_time || '09:00'} - ${task.end_time || '17:00'}`;
                                        })()}
                                    </span>
                                )}
                                <span>⚡ Priority: {task.priority}</span>
                                <span>📋 Type: {task.type.replace(/_/g, ' ')}</span>
                            </div>
                            {task.deliverables && Object.keys(task.deliverables).length > 0 && (
                                <div className="mt-2 pt-1.5 border-t border-green-200/50">
                                    <p className="text-[10px] font-semibold text-gray-500 mb-0.5">Required Deliverables:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(task.deliverables).map(([key, count]) => (
                                            <span key={key} className="text-[9px] bg-white/60 px-1.5 py-0.5 rounded text-gray-600">
                                                {count}x {key.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-1 justify-end mt-1.5">
                                <span className="text-[9px] text-gray-500/70">
                                    {getValidDate(task.sent_at || task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="material-symbols-outlined text-[13px] text-[#53bdeb]">done_all</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reporter response messages */}
                {reporterReplies.map((reply, index) => (
                    <div
                        key={index}
                        className={`flex flex-col gap-1 max-w-[85%] animate-fade-in ${reply.direction === 'outbound' ? 'items-end self-end' : 'items-start'
                            }`}
                        style={{ animationDelay: `${(index + 1) * 150}ms` }}
                    >
                        <div
                            className={`p-2 px-3 rounded-lg shadow-sm ${reply.direction === 'outbound'
                                ? 'bg-[#d9fdd3] rounded-tr-none'
                                : 'bg-white rounded-tl-none'
                                }`}
                        >
                            {reply.direction === 'inbound' && (
                                <p className="text-[11px] font-bold mb-0.5 text-primary">
                                    {assignee?.name || 'Reporter'}
                                </p>
                            )}
                            <p className="text-[12px] text-gray-900 leading-relaxed">{reply.content}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                                <span className="text-[9px] text-gray-500/70">{reply.time}</span>
                                {reply.direction === 'outbound' && (
                                    <span className="material-symbols-outlined text-[13px] text-[#53bdeb]">done_all</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Admin-sent messages */}
                {sentMessages.map((msg, index) => (
                    <div
                        key={`sent-${index}`}
                        className="flex flex-col gap-1 max-w-[85%] items-end self-end animate-fade-in"
                    >
                        <div className="p-2 px-3 rounded-lg rounded-tr-none shadow-sm bg-[#d9fdd3]">
                            <p className="text-[12px] text-gray-900 leading-relaxed">{msg.content}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                                <span className="text-[9px] text-gray-500/70">{msg.time}</span>
                                <span className="material-symbols-outlined text-[13px] text-[#53bdeb]">done_all</span>
                            </div>
                        </div>
                    </div>
                ))}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area - shrink-0 keeps it pinned at bottom */}
            <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 shrink-0 border-t border-border z-30">
                <div className="w-full flex items-center gap-2">
                    <button className="text-text-secondary p-2 hover:bg-black/5 rounded-full transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[24px]">add</span>
                    </button>
                    <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center gap-2 border border-white focus-within:border-white shadow-sm h-10">
                        <input
                            className="bg-transparent border-none focus:ring-0 outline-none w-full text-sm text-text-primary p-0 placeholder:text-text-secondary h-full"
                            placeholder="Type a message"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="text-text-secondary hover:text-primary transition-colors shrink-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                        </button>
                    </div>
                    {messageInput.trim() ? (
                        <button
                            onClick={handleSend}
                            className="bg-[#00a884] text-white p-2 rounded-full hover:bg-[#008f6f] transition-colors shadow-sm active:scale-95 flex items-center justify-center shrink-0 w-10 h-10"
                        >
                            <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                        </button>
                    ) : (
                        <button className="text-text-secondary p-2 hover:bg-black/5 rounded-full transition-colors shrink-0 w-10 h-10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">mic</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
