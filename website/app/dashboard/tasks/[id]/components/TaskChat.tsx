'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { TaskMessage } from '@/types/message';
import { useAuth } from '@/lib/auth/AuthContext';
import { useParams } from 'next/navigation';

export default function TaskChat() {
    const params = useParams();
    const taskId = params?.id as string;
    const { user } = useAuth();
    const { messages, isLoading } = useMessages(taskId);
    const { mutate: sendMessage } = useSendMessage();

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !user || !taskId) return;

        sendMessage({
            task_id: taskId,
            sender_id: user.uid, // Assuming user.uid maps to employee ID
            sender_name: user.displayName || 'Unknown',
            message_type: 'TEXT',
            content: input.trim(),
            direction: 'OUTBOUND', // Internal users sending to task chat
            status: 'SENT',
            is_system_message: false,
        });

        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Loading chat...</div>;
    }

    return (
        <div className="flex flex-col h-150 bg-white rounded-lg border shadow-sm">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Team Chat</h3>
                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">
                    {messages.length} messages
                </span>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-20">chat_bubble_outline</span>
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.sender_id === user?.uid}
                        />
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 transform duration-100"
                    >
                        <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function MessageBubble({ message, isOwn }: { message: TaskMessage; isOwn: boolean }) {
    const time = new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
            {!isOwn && (
                <span className="text-xs text-gray-500 ml-1 mb-1">{message.sender_name}</span>
            )}
            <div className={`
                px-4 py-2.5 rounded-2xl text-sm shadow-sm relative group
                ${isOwn
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }
            `}>
                <p className="leading-relaxed">{message.content}</p>
                <div className={`
                    text-[10px] mt-1 flex items-center gap-1 opacity-70
                    ${isOwn ? 'text-blue-100 justify-end' : 'text-gray-400 justify-start'}
                `}>
                    {time}
                    {isOwn && (
                        <span className="material-symbols-outlined text-[12px]">done_all</span>
                    )}
                </div>
            </div>
        </div>
    );
}
