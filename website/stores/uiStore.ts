import { create } from 'zustand';
import { TaskStatus, Priority } from '@/types/common';

interface UIState {
    sidebarOpen: boolean;
    chatPanelOpen: boolean;
    activeChatTaskId: string | null;
    createTaskModalOpen: boolean;
    activeView: 'all' | 'my' | 'team';
    viewMode: 'grid' | 'list';
    statusFilters: TaskStatus[];
    priorityFilters: Priority[];
    searchQuery: string;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleChatPanel: () => void;
    setChatPanelOpen: (open: boolean) => void;
    setActiveChatTaskId: (id: string | null) => void;
    setCreateTaskModalOpen: (open: boolean) => void;
    setActiveView: (view: 'all' | 'my' | 'team') => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    toggleStatusFilter: (status: TaskStatus) => void;
    togglePriorityFilter: (priority: Priority) => void;
    setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    chatPanelOpen: false,
    activeChatTaskId: 'tsk-001',
    createTaskModalOpen: false,
    activeView: 'all',
    viewMode: 'grid',
    statusFilters: ['IN_PROGRESS'],
    priorityFilters: ['URGENT'],
    searchQuery: '',

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleChatPanel: () => set((s) => ({ chatPanelOpen: !s.chatPanelOpen })),
    setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
    setActiveChatTaskId: (id) => set({ activeChatTaskId: id, chatPanelOpen: true }),
    setCreateTaskModalOpen: (open) => set({ createTaskModalOpen: open }),
    setActiveView: (view) => set({ activeView: view }),
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleStatusFilter: (status) =>
        set((s) => ({
            statusFilters: s.statusFilters.includes(status)
                ? s.statusFilters.filter((f) => f !== status)
                : [...s.statusFilters, status],
        })),
    togglePriorityFilter: (priority) =>
        set((s) => ({
            priorityFilters: s.priorityFilters.includes(priority)
                ? s.priorityFilters.filter((f) => f !== priority)
                : [...s.priorityFilters, priority],
        })),
    setSearchQuery: (query) => set({ searchQuery: query }),
}));
