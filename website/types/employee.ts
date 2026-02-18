import { EmployeeRole, EmployeeStatus, Availability, ApprovalStatus } from './common';

export interface Employee {
    id: string;
    name: string;
    email: string;
    whatsapp_uid?: string;
    phone_number?: string;
    role: EmployeeRole;
    department?: string;
    status: EmployeeStatus;
    availability: Availability;
    approvalStatus?: ApprovalStatus;
    current_location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    skills?: string[];
    performance_score?: number;
    response_time_avg?: number;
    total_tasks_completed?: number;
    created_at: string;
    last_active?: string;
    manager_id?: string;
    avatar_url?: string;
    is_external?: boolean;
    source?: 'platform' | 'csv' | 'excel';
}
