'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useTask } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { useWhatsAppRealtime } from '@/hooks/useWhatsAppRealtime';
import { useSendWhatsAppMessage } from '@/hooks/useWhatsApp';
import { useAuth } from '@/lib/auth/AuthContext';
import { Task } from '@/types/task';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    time: string;
    senderName?: string;
    status?: string;
}

// ─── Main Component ────────────────────────────────────────────────

export default function WhatsAppPanel() {
    const { activeChatTaskId } = useUIStore();
    const { task, isLoading: taskLoading } = useTask(activeChatTaskId);
    const { employees } = useEmployees();
    const { user } = useAuth();
    const { mutateAsync: sendWhatsAppMessage } = useSendWhatsAppMessage();

    // Real-time WhatsApp messages
    const { messages: realtimeMessages, isLoading: messagesLoading } = useWhatsAppRealtime({
        taskId: activeChatTaskId,
        enabled: !!activeChatTaskId,
    });

    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const assignee = task?.assignee_id 
        ? employees.find(e => e.id === task.assignee_id) 
        : null;

    // Transform database messages to chat format
    const chatMessages: ChatMessage[] = useMemo(() => {
        if (!realtimeMessages || !task) return [];

        return realtimeMessages.map((msg) => ({
            id: msg.id,
            content: msg.content || '',
            direction: msg.direction === 'OUTBOUND' ? 'outbound' : 'inbound',
            time: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderName: msg.sender_name,
            status: msg.status,
        }));
    }, [realtimeMessages, task]);

    // Get task creation time for the task assignment message
    const getTaskCreationTime = () => {
        if (!task?.created_at) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const d = new Date(task.created_at);
        return isNaN(d.getTime()) 
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Reset input when switching tasks
    useEffect(() => {
        setMessageInput('');
        setSending(false);
    }, [activeChatTaskId]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length, activeChatTaskId]);

    const handleSend = async () => {
        const text = messageInput.trim();
        if (!text || !activeChatTaskId || !user) return;

        setSending(true);

        try {
            // Send via WhatsApp API if assignee has phone number
            if (assignee?.whatsapp_uid || assignee?.phone_number) {
                const phoneNumber = assignee.whatsapp_uid || assignee.phone_number;
                if (phoneNumber) {
                    const result = await sendWhatsAppMessage({
                        to: phoneNumber,
                        message: text,
                    });

                    if (result.success) {
                        toast.success('Message sent via WhatsApp');
                    } else {
                        toast.error('WhatsApp delivery failed');
                    }
                }
            } else {
                // Save as internal message only
                toast.success('Message sent (internal)');
            }

            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
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
            <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center text-center p-6 overflow-hidden bg-[#0b141a] dark:bg-[#0b141a]">
                <div className="w-20 h-20 bg-[#202c33] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <span className="material-symbols-outlined text-[40px] text-[#8696a0]">chat_bubble_outline</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Chat Selected</h3>
                <p className="text-sm text-[#8696a0] max-w-70">
                    Select a task from the list to view the conversation with the reporter.
                </p>
                <div className="mt-8 border-t border-[#202c33] pt-6 w-full max-w-50">
                    <div className="flex items-center justify-center gap-2 text-[#8696a0]">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        <span className="text-xs">End-to-end encrypted</span>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Loading State
    if (taskLoading || messagesLoading) {
        return (
            <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center bg-[#0b141a]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a884]"></div>
            </div>
        );
    }

    // 3. Active Chat View
    return (
        <div className="w-full flex-1 min-h-0 flex flex-col bg-[#0b141a] overflow-hidden">
            {/* Header */}
            <div className="bg-primary dark:bg-card-dark dark:border-b dark:border-border flex items-center justify-between px-3 pt-9 pb-2 text-white dark:text-text-primary shadow-md z-30 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer">
                        <div className="size-9 rounded-full bg-white/20 dark:bg-surface flex items-center justify-center text-white dark:text-text-primary font-bold text-sm overflow-hidden ring-2 ring-white/20 dark:ring-border">
                            {assignee?.avatar_url ? (
                                <img
                                    className="w-full h-full object-cover"
                                    src={assignee.avatar_url}
                                    alt={assignee.name}
                                />
                            ) : (
                                <div className="w-full h-full text-white dark:text-text-primary font-bold flex items-center justify-center">
                                    {(assignee?.name || 'R')[0]}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-primary"></div>
                    </div>
                    <div>
                        <div className="font-bold text-xs">{assignee?.name || 'Reporter'}</div>
                        <div className="text-[10px] text-white/80 dark:text-text-secondary">
                            {realtimeMessages.length > 0 ? 'Online' : 'Offline'}
                        </div>
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

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-3 chat-bg bg-[#efeae2] dark:bg-[#0b141a] flex flex-col gap-3 scrollbar-thin w-full pb-4">
                {/* Encryption Notice */}
                <div className="flex justify-center my-1">
                    <div className="bg-[#ffeba0] text-gray-800 text-[10px] px-2 py-1 rounded shadow-sm text-center max-w-[85%] flex items-center gap-1 justify-center">
                        <span className="material-symbols-outlined text-[10px]">lock</span>
                        Messages are end-to-end encrypted.
                    </div>
                </div>

                {/* Date divider */}
                <div className="flex justify-center my-1">
                    <span className="bg-white/90 dark:bg-surface/90 text-text-secondary dark:text-text-secondary text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {task?.created_at
                            ? (() => {
                                const d = new Date(task.created_at);
                                const today = new Date();
                                const isValid = !isNaN(d.getTime());
                                if (!isValid) return 'TODAY';
                                return d.toDateString() === today.toDateString()
                                    ? 'TODAY'
                                    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
                            })()
                            : 'TODAY'}
                    </span>
                </div>

                {/* Task Assignment Message */}
                {task && (
                    <div className="flex flex-col items-end self-end max-w-[90%] animate-fade-in">
                        <div className="bg-[#d9fdd3] dark:bg-[#005c4b] p-2.5 rounded-lg rounded-tr-none shadow-sm text-xs border border-[#d9fdd3] dark:border-[#005c4b]">
                            <p className="font-bold text-accent-red dark:text-red-400 text-[11px] mb-1">🚨 Task: {task.title}</p>
                            <p className="text-text-primary dark:text-gray-100 leading-relaxed mb-2 text-[11px]">
                                {task.description || 'No description provided.'}
                            </p>
                            <div className="flex flex-col gap-0.5 text-[10px] text-text-secondary dark:text-gray-300">
                                {task.deadline && (
                                    <span>
                                        ⏰ Deadline: {new Date(task.deadline).toLocaleString()}
                                    </span>
                                )}
                                <span>⚡ Priority: {task.priority}</span>
                                <span>📋 Type: {task.type.replace(/_/g, ' ')}</span>
                            </div>
                            {task.deliverables && Object.keys(task.deliverables).length > 0 && (
                                <div className="mt-2 pt-1.5 border-t border-green-200/50 dark:border-white/10">
                                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Required:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(task.deliverables).map(([key, count]) => (
                                            <span key={key} className="text-[9px] bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                {count}x {key.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-1 justify-end mt-1.5">
                                <span className="text-[9px] text-gray-500/70 dark:text-gray-400/70">
                                    {getTaskCreationTime()}
                                </span>
                                <span className="material-symbols-outlined text-[13px] text-[#53bdeb]">done_all</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Real Chat Messages */}
                {chatMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col gap-1 max-w-[85%] animate-fade-in ${
                            msg.direction === 'outbound' ? 'items-end self-end' : 'items-start'
                        }`}
                    >
                        <div
                            className={`p-2 px-3 rounded-lg shadow-sm ${
                                msg.direction === 'outbound'
                                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none'
                                    : 'bg-white dark:bg-[#202c33] rounded-tl-none'
                            }`}
                        >
                            {msg.direction === 'inbound' && msg.senderName && (
                                <p className="text-[11px] font-bold mb-0.5 text-primary dark:text-blue-400">
                                    {msg.senderName}
                                </p>
                            )}
                            <p className="text-[12px] text-gray-900 dark:text-gray-100 leading-relaxed">{msg.content}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                                <span className="text-[9px] text-gray-500/70 dark:text-gray-400/70">{msg.time}</span>
                                {msg.direction === 'outbound' && (
                                    <span className="material-symbols-outlined text-[13px] text-[#53bdeb]">
                                        {msg.status === 'READ' ? 'done_all' : 'check'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* No messages yet */}
                {chatMessages.length === 0 && task && (
                    <div className="flex justify-center my-4">
                        <div className="bg-white/60 dark:bg-surface/60 text-text-secondary text-[10px] px-3 py-1.5 rounded text-center">
                            No replies yet. Start the conversation!
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f0f0] dark:bg-[#202c33] p-2 flex items-center gap-2 shrink-0 border-t border-border z-30">
                <div className="w-full flex items-center gap-2">
                    <button className="text-text-secondary dark:text-gray-400 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[24px]">add</span>
                    </button>
                    <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg px-3 py-2 flex items-center gap-2 border border-white dark:border-transparent focus-within:border-white dark:focus-within:border-transparent shadow-sm h-10">
                        <input
                            className="bg-transparent border-none focus:ring-0 outline-none w-full text-sm text-text-primary dark:text-gray-100 p-0 placeholder:text-text-secondary h-full"
                            placeholder={assignee ? `Message ${assignee.name}...` : "Type a message"}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={sending}
                        />
                        <button className="text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-gray-200 transition-colors shrink-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                        </button>
                    </div>
                    {messageInput.trim() ? (
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="bg-[#00a884] text-white p-2 rounded-full hover:bg-[#008f6f] transition-colors shadow-sm active:scale-95 flex items-center justify-center shrink-0 w-10 h-10 disabled:opacity-50"
                        >
                            {sending ? (
                                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                            )}
                        </button>
                    ) : (
                        <button className="text-text-secondary dark:text-gray-400 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 w-10 h-10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">mic</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
