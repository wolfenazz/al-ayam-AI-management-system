import { MessageType, MessageDirection, MessageDeliveryStatus } from './common';

export interface TaskMessage {
    id: string;
    task_id: string;
    sender_id: string;
    sender_name?: string;
    message_type: MessageType;
    content?: string;
    media_url?: string;
    media_type?: string;
    media_size?: number;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    whatsapp_message_id?: string;
    direction: MessageDirection;
    status: MessageDeliveryStatus;
    sent_at: string;
    delivered_at?: string;
    read_at?: string;
    is_system_message: boolean;
    metadata?: Record<string, unknown>;
}
