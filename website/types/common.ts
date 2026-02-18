// Common types shared across the application

export type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export type TaskStatus =
    | 'DRAFT'
    | 'SENT'
    | 'READ'
    | 'ACCEPTED'
    | 'IN_PROGRESS'
    | 'REVIEW'
    | 'COMPLETED'
    | 'REJECTED'
    | 'OVERDUE'
    | 'CANCELLED';

export type TaskType =
    | 'BREAKING_NEWS'
    | 'PRESS_CONF'
    | 'INTERVIEW'
    | 'PHOTO_ASSIGN'
    | 'VIDEO_ASSIGN'
    | 'FACT_CHECK'
    | 'FOLLOW_UP'
    | 'CUSTOM';

export type EmployeeRole =
    | 'Journalist'
    | 'Editor'
    | 'Photographer'
    | 'Manager'
    | 'Admin';

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export type Availability = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION' | 'SYSTEM';

export type MessageDirection = 'OUTBOUND' | 'INBOUND';

export type MessageDeliveryStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type NotificationType =
    | 'TASK_ASSIGNED'
    | 'TASK_ACCEPTED'
    | 'TASK_COMPLETED'
    | 'DEADLINE_APPROACHING'
    | 'OVERDUE'
    | 'ESCALATION'
    | 'MEDIA_UPLOADED'
    | 'SYSTEM';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
