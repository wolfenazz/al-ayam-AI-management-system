'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import EmployeeSidebar from '@/components/layout/EmployeeSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUIStore } from '@/stores/uiStore';

export default function EmployeeDashboardLayout({ children }: { children: React.ReactNode }) {
    // Reusing the same UI store for sidebar toggle
    const { sidebarOpen } = useUIStore();

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen overflow-hidden">
                <Header />

                <div className="flex flex-1 overflow-hidden">
                    <EmployeeSidebar />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto bg-background scrollbar-thin relative">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
