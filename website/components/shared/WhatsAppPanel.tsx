'use client';

import React, { useState, useRef, useEffect } from 'react';
import { mockMessages, mockEmployees } from '@/lib/mock-data';
import { TaskMessage } from '@/types/message';
import { useUIStore } from '@/stores/uiStore';
import { useTask } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';

export default function WhatsAppPanel() {
    const { activeChatTaskId } = useUIStore(); // Get selected task ID
    const { task, isLoading: taskLoading } = useTask(activeChatTaskId);
    const { employees } = useEmployees();

    const [messageInput, setMessageInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Filter messages for the active task (using mock data for now)
    // If mocking, we might not have task_id match, so let's just show all if task is selected for demo
    // UPDATE: Let's assume mockMessages have some task_id or we just show them for ANY task for now.
    // Ideally: const messages = mockMessages.filter(m => m.task_id === activeChatTaskId);
    const messages = activeChatTaskId ? mockMessages : [];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeChatTaskId]);

    const handleSend = () => {
        if (messageInput.trim()) {
            // optimized: logic to send message
            setMessageInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const assignee = task?.assignee_id ? employees.find(e => e.id === task.assignee_id) : null;

    // 1. Empty State: No Task Selected
    if (!activeChatTaskId) {
        return (
            <aside className="w-full h-full bg-[#f0f2f5] flex flex-col items-center justify-center text-center p-6 relative z-10 overflow-hidden">
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
            </aside>
        );
    }

    // 2. Loading State
    if (taskLoading) {
        return (
            <aside className="w-full h-full bg-white flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </aside>
        );
    }

    // 3. Active Chat View
    return (
        <aside className="w-full h-full bg-white flex flex-col shrink-0 relative z-10 overflow-hidden">
            {/* Header */}
            <div className="bg-primary flex items-center justify-between px-4 pt-12 pb-3 text-white shrink-0 shadow-md z-20">
                <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer">
                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-white/20">
                            {assignee?.avatar_url ? (
                                <img
                                    className="w-full h-full object-cover"
                                    src={assignee.avatar_url}
                                    alt={assignee.name}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-[24px]">group</span>
                            )}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-primary rounded-full ${assignee?.availability === 'AVAILABLE' ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-sm leading-tight truncate max-w-[140px]">
                            {assignee ? assignee.name : 'Unknown Reporter'}
                        </h3>
                        <p className="text-[10px] text-white/80 truncate max-w-[140px]">
                            {task?.title || 'No Task Title'}
                        </p>
                    </div>
                </div>
                <button className="hover:bg-white/10 rounded-full p-1.5 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
            </div>

            {/* Chat Area */}
            <div
                className="flex-1 overflow-y-auto p-4 chat-bg flex flex-col gap-4 scrollbar-thin"
                style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}
            >
                {/* Encryption Notice */}
                <div className="flex justify-center my-2">
                    <div className="bg-[#ffeba0] text-gray-800 text-[10px] px-2 py-1 rounded shadow-sm text-center max-w-[80%] flex items-center gap-1 justify-center">
                        <span className="material-symbols-outlined text-[10px]">lock</span>
                        Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                    </div>
                </div>

                {/* Today divider */}
                <div className="flex justify-center my-2">
                    <span className="bg-white/90 text-text-secondary text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        TODAY
                    </span>
                </div>

                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                        <p className="text-sm text-gray-500">No messages yet.</p>
                        <p className="text-xs text-gray-400">Send a message to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <MessageBubble key={msg.id} message={msg} index={index} />
                    ))
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 pb-8 bg-[#f0f2f5] shrink-0 border-t border-border z-20">
                <div className="flex items-center gap-2">
                    <button className="text-text-secondary p-2 hover:bg-black/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[24px]">add</span>
                    </button>
                    <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center gap-2 border border-white focus-within:border-white">
                        <input
                            className="bg-transparent border-none focus:ring-0 outline-none w-full text-sm text-text-primary p-0 placeholder:text-text-secondary"
                            placeholder="Type a message"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="text-text-secondary hover:text-primary transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                        </button>
                    </div>
                    {messageInput.trim() ? (
                        <button
                            onClick={handleSend}
                            className="bg-[#00a884] text-white p-2 rounded-full hover:bg-[#008f6f] transition-colors shadow-sm active:scale-95 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                        </button>
                    ) : (
                        <button className="text-text-secondary p-2 hover:bg-black/5 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[24px]">mic</span>
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}

function MessageBubble({ message, index }: { message: TaskMessage; index: number }) {
    const isOutbound = message.direction === 'OUTBOUND';
    const sender = mockEmployees.find((e) => e.id === message.sender_id);
    const senderColor = getSenderColor(message.sender_name || '');

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (message.message_type === 'AUDIO') {
        return (
            <div className="flex flex-col gap-1 items-start max-w-[85%] animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="relative size-10 shrink-0">
                        <div
                            className="w-10 h-10 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: sender?.avatar_url ? `url('${sender.avatar_url}')` : undefined }}
                        >
                            {!sender?.avatar_url && (
                                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {(message.sender_name || 'U')[0]}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                            <span className="material-symbols-outlined text-green-500 text-[16px]">mic</span>
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-500 text-[20px] cursor-pointer hover:text-primary transition-colors">
                                play_arrow
                            </span>
                            <div className="h-1 bg-gray-200 rounded-full flex-1 relative">
                                <div className="absolute left-0 top-0 h-full w-1/3 bg-gray-400 rounded-full" />
                                <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full" />
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">0:15 • {formatTime(message.sent_at)}</span>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 ml-2">{message.sender_name}</p>
            </div>
        );
    }

    if (message.message_type === 'IMAGE') {
        return (
            <div className="flex flex-col gap-1 items-start max-w-[85%] animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="bg-white p-1.5 rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                    <p className="text-xs font-bold px-1.5 pt-1.5 mb-1" style={{ color: senderColor }}>
                        {message.sender_name}
                    </p>
                    <div className="rounded overflow-hidden mb-1 relative group cursor-pointer">
                        <div
                            className="bg-cover bg-center h-32 w-full"
                            style={{ backgroundImage: `url('${message.media_url}')` }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white">download</span>
                        </div>
                    </div>
                    {message.content && (
                        <p className="text-sm text-text-primary px-1.5 pb-0.5">{message.content}</p>
                    )}
                    <span className="text-[10px] text-gray-400 block text-right px-1.5 pb-1">
                        {formatTime(message.sent_at)}
                    </span>
                </div>
            </div>
        );
    }

    // TEXT message
    return (
        <div
            className={`flex flex-col gap-1 max-w-[85%] animate-fade-in ${isOutbound ? 'items-end self-end' : 'items-start'
                }`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div
                className={`p-2 px-3 rounded-lg shadow-sm border ${isOutbound
                    ? 'bg-[#d9fdd3] rounded-tr-none border-[#d9fdd3]'
                    : 'bg-white rounded-tl-none border-white'
                    }`}
            >
                {!isOutbound && (
                    <p className="text-xs font-bold mb-1" style={{ color: senderColor }}>
                        {message.sender_name}
                    </p>
                )}
                <p className="text-sm text-gray-900 leading-relaxed">{message.content}</p>
                <div className={`flex items-center gap-1 mt-0.5 ${isOutbound ? 'justify-end' : 'justify-end'}`}>
                    <span className="text-[10px] text-gray-500/80">{formatTime(message.sent_at)}</span>
                    {isOutbound && message.status === 'READ' && (
                        <span className="material-symbols-outlined text-[14px] text-[#53bdeb]">done_all</span>
                    )}
                    {isOutbound && message.status === 'DELIVERED' && (
                        <span className="material-symbols-outlined text-[14px] text-gray-400">done_all</span>
                    )}
                    {isOutbound && message.status === 'SENT' && (
                        <span className="material-symbols-outlined text-[14px] text-gray-400">done</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function getSenderColor(name: string): string {
    const colors = ['#e542a3', '#1e3fae', '#16a34a', '#ea580c', '#7c3aed', '#0891b2'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
