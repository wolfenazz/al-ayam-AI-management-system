import { NotificationType, NotificationPriority, NotificationStatus } from './common';

export interface Notification {
    id: string;
    recipient_id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    action_url?: string;
    task_id?: string;
    channels?: string[];
    status: NotificationStatus;
    created_at: string;
    sent_at?: string;
    read_at?: string;
    expires_at?: string;
}
