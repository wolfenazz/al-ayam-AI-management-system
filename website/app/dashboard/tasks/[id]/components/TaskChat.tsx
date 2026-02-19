'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useTask } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { TaskMessage } from '@/types/message';
import { useAuth } from '@/lib/auth/AuthContext';
import { useParams } from 'next/navigation';
import { useSendWhatsAppMessage } from '@/hooks/useWhatsApp';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────

interface TaskChatProps {
    taskId?: string;
}

interface MessageStatus {
    state: 'idle' | 'sending' | 'sent' | 'error';
    error?: string;
}

// ─── Main Component ────────────────────────────────────────────────

export default function TaskChat({ taskId: externalTaskId }: TaskChatProps = {}) {
    const params = useParams();
    const taskId = externalTaskId || (params?.id as string);
    const { user } = useAuth();
    const { messages, isLoading: messagesLoading } = useMessages(taskId);
    const { task, isLoading: taskLoading } = useTask(taskId);
    const { employees } = useEmployees();
    
    // Mutations
    const { mutate: sendMessage } = useSendMessage();
    const { mutateAsync: sendWhatsAppMessage } = useSendWhatsAppMessage();

    const [input, setInput] = useState('');
    const [messageStatus, setMessageStatus] = useState<MessageStatus>({ state: 'idle' });
    const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Find assignee
    const assignee = task?.assignee_id 
        ? employees.find(e => e.id === task.assignee_id) 
        : null;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !user || !taskId) return;

        setMessageStatus({ state: 'sending' });

        try {
            // 1. Save message to database (internal chat)
            sendMessage({
                task_id: taskId,
                sender_id: user.uid,
                sender_name: user.displayName || 'Unknown',
                message_type: 'TEXT',
                content: input.trim(),
                direction: 'OUTBOUND',
                status: 'SENT',
                is_system_message: false,
            });

            // 2. Send via WhatsApp if enabled and assignee exists
            if (sendViaWhatsApp && assignee) {
                const phoneNumber = assignee.whatsapp_uid || assignee.phone_number;
                
                if (phoneNumber) {
                    try {
                        const result = await sendWhatsAppMessage({
                            to: phoneNumber,
                            message: input.trim(),
                        });

                        if (result.success) {
                            toast.success('Message sent via WhatsApp');
                        } else {
                            toast.warning('Saved internally, but WhatsApp delivery failed');
                        }
                    } catch (whatsappError) {
                        console.error('WhatsApp send error:', whatsappError);
                        toast.warning('Message saved internally. WhatsApp not configured or failed.');
                    }
                } else {
                    toast.warning('Assignee has no WhatsApp number configured');
                }
            }

            setMessageStatus({ state: 'sent' });
            setInput('');

            // Reset status after a moment
            setTimeout(() => setMessageStatus({ state: 'idle' }), 2000);

        } catch (error) {
            console.error('Failed to send message:', error);
            setMessageStatus({ 
                state: 'error', 
                error: 'Failed to send message' 
            });
            toast.error('Failed to send message');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isLoading = messagesLoading || taskLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col h-[400px] bg-white rounded-lg border shadow-sm">
                <div className="p-4 text-center text-gray-500 flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <p className="text-sm">Loading chat...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[400px] bg-white rounded-lg border shadow-sm">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Team Chat</h3>
                    {assignee && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {assignee.name}
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">
                    {messages.length} messages
                </span>
            </div>

            {/* WhatsApp Toggle */}
            {assignee && (
                <div className="px-4 py-2 bg-green-50/50 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-green-600">chat</span>
                        <span className="text-xs text-gray-600">
                            Send via WhatsApp
                        </span>
                    </div>
                    <button
                        onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                            sendViaWhatsApp ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                sendViaWhatsApp ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-20">chat_bubble_outline</span>
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                        {assignee && sendViaWhatsApp && (
                            <p className="text-xs text-green-600">
                                Messages will also be sent to {assignee.name} via WhatsApp
                            </p>
                        )}
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
                {/* Status indicator */}
                {messageStatus.state === 'sending' && (
                    <div className="mb-2 text-xs text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        Sending...
                    </div>
                )}
                {messageStatus.state === 'error' && (
                    <div className="mb-2 text-xs text-red-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {messageStatus.error}
                    </div>
                )}
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={assignee 
                            ? `Message ${assignee.name}...` 
                            : "Type a message..."
                        }
                        disabled={messageStatus.state === 'sending'}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || messageStatus.state === 'sending'}
                        className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 transform duration-100"
                    >
                        {messageStatus.state === 'sending' ? (
                            <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                        )}
                    </button>
                </div>
                
                {assignee && !assignee.whatsapp_uid && !assignee.phone_number && (
                    <p className="mt-2 text-xs text-orange-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Assignee has no WhatsApp number configured
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Message Bubble Component ──────────────────────────────────────

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
                        <span className="material-symbols-outlined text-[12px]">
                            {message.status === 'READ' ? 'done_all' : 'check'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
