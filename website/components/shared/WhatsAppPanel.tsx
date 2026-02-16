'use client';

import React, { useState, useRef, useEffect } from 'react';
import { mockMessages, mockEmployees } from '@/lib/mock-data';
import { TaskMessage } from '@/types/message';

export default function WhatsAppPanel() {
    const [messageInput, setMessageInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const messages = mockMessages;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = () => {
        if (messageInput.trim()) {
            setMessageInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <aside className="w-full h-full bg-white flex flex-col shrink-0 relative z-10 overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-primary flex items-center justify-between px-4 text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                            <img
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP4_TdYQa5W8GLB6RAp_Uc7eZ3OWZWLncfzUpPqu-1ZkENlCFi3OKGT--n1kdK3UxlH8_nRyReNBInMSk1YzinYjyHQmB_H40riNtEieLJJ-Di9ibDM5ytTb-YP5xwWOQu6713oXL4JLJUmzlJbhq9NIjP8jVFiip7f5drvCu6aHFvVvIcps26DKmTWl65LrcCXyKDCXFic_h8xmhhV8HPHkx2huZrsU9k_lQXlNUwF2RAtJMAX_QP9yio8g2kfSYwM1zHMp2B6TY"
                                alt="Group chat"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-primary rounded-full" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Bahrain Field Team</h3>
                        <p className="text-xs text-white/70">Ahmed, Sarah, Khalid...</p>
                    </div>
                </div>
                <button className="hover:bg-white/10 rounded-full p-1.5 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 chat-bg flex flex-col gap-4 scrollbar-thin">
                {/* Today divider */}
                <div className="flex justify-center my-2">
                    <span className="bg-border text-text-secondary text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        TODAY
                    </span>
                </div>

                {messages.map((msg, index) => (
                    <MessageBubble key={msg.id} message={msg} index={index} />
                ))}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white shrink-0 border-t border-border">
                <div className="flex items-end gap-2">
                    <button className="text-text-secondary p-2 hover:bg-surface rounded-full transition-colors">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <div className="flex-1 bg-surface rounded-2xl px-4 py-2 flex items-center gap-2">
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
                    <button
                        onClick={handleSend}
                        className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors shadow-md active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                    </button>
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
                className={`p-3 rounded-lg shadow-sm border ${isOutbound
                    ? 'bg-[#dcf8c6] rounded-tr-none border-green-100'
                    : 'bg-white rounded-tl-none border-gray-100'
                    }`}
            >
                {!isOutbound && (
                    <p className="text-xs font-bold mb-1" style={{ color: senderColor }}>
                        {message.sender_name}
                    </p>
                )}
                <p className="text-sm text-text-primary leading-relaxed">{message.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isOutbound ? 'justify-end' : 'justify-end'}`}>
                    <span className="text-[10px] text-gray-400">{formatTime(message.sent_at)}</span>
                    {isOutbound && message.status === 'READ' && (
                        <span className="material-symbols-outlined text-[12px] text-blue-500">done_all</span>
                    )}
                    {isOutbound && message.status === 'DELIVERED' && (
                        <span className="material-symbols-outlined text-[12px] text-gray-400">done_all</span>
                    )}
                    {isOutbound && message.status === 'SENT' && (
                        <span className="material-symbols-outlined text-[12px] text-gray-400">done</span>
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
