import { Priority, TaskStatus, TaskType } from './common';

export interface Task {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    priority: Priority;
    status: TaskStatus;
    assignee_id?: string;
    creator_id: string;
    news_item_id?: string;
    whatsapp_thread_id?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    deadline?: string;
    estimated_duration?: number;
    budget?: number;
    deliverables?: Record<string, number>;
    created_at: string;
    sent_at?: string;
    read_at?: string;
    accepted_at?: string;
    started_at?: string;
    completed_at?: string;
    reviewed_at?: string;
    response_time?: number;
    completion_time?: number;
    quality_rating?: number;
    escalation_count?: number;
    last_reminder_sent?: string;
}

export interface TaskTemplate {
    id: string;
    name: string;
    type: TaskType;
    description?: string;
    default_priority: Priority;
    default_duration?: number;
    required_deliverables?: Record<string, number>;
    message_template: string;
    is_active: boolean;
    created_by: string;
    created_at: string;
    usage_count?: number;
}

export interface TaskFilters {
    status?: TaskStatus[];
    priority?: Priority[];
    type?: TaskType[];
    assignee_id?: string;
    search?: string;
}
