'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import WhatsAppPanel from '@/components/shared/WhatsAppPanel';
import { Iphone17Pro } from '@/components/ui/Iphone17Pro';
import CreateTaskModal from './tasks/components/CreateTaskModal';
import { useUIStore } from '@/stores/uiStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { chatPanelOpen, toggleChatPanel } = useUIStore();

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <div className="flex flex-col h-screen overflow-hidden">
                <Header />

                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto bg-background-light scrollbar-thin relative">
                        {children}
                    </main>

                    {/* WhatsApp Chat Panel inside iPhone Frame — Slide in/out */}
                    <div
                        className={`hidden lg:flex items-center justify-center transition-all duration-500 ease-in-out bg-gradient-to-b from-gray-50 to-gray-100/50 ${chatPanelOpen ? 'w-[340px] opacity-100' : 'w-0 opacity-0'
                            } overflow-hidden shrink-0`}
                    >
                        <div className="py-4 px-3 flex items-center justify-center shrink-0">
                            <Iphone17Pro
                                width={310}
                                height={630}
                                className="drop-shadow-2xl"
                            >
                                <WhatsAppPanel />
                            </Iphone17Pro>
                        </div>
                    </div>
                </div>

                {/* Floating WhatsApp Toggle Button */}
                <button
                    onClick={toggleChatPanel}
                    className={`
                        hidden lg:flex fixed bottom-6 right-6 z-40
                        items-center gap-2 px-4 py-3 rounded-full
                        shadow-lg hover:shadow-xl
                        transition-all duration-300 active:scale-95
                        ${chatPanelOpen
                            ? 'bg-white text-text-secondary border border-border hover:text-accent-red hover:border-accent-red/30'
                            : 'bg-[#25D366] text-white hover:bg-[#20BD5A]'
                        }
                    `}
                    title={chatPanelOpen ? 'Hide WhatsApp Panel' : 'Show WhatsApp Panel'}
                >
                    <span className="material-symbols-outlined text-[22px]">
                        {chatPanelOpen ? 'close' : 'chat'}
                    </span>
                    {!chatPanelOpen && (
                        <span className="text-sm font-bold">WhatsApp</span>
                    )}
                </button>

                {/* Create Task Modal */}
                <CreateTaskModal />
            </div>
        </ProtectedRoute>
    );
}
