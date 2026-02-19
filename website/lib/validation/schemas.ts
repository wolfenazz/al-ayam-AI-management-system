import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────

export const PrioritySchema = z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']);
export const TaskStatusSchema = z.enum([
    'DRAFT', 'SENT', 'READ', 'ACCEPTED', 'IN_PROGRESS',
    'REVIEW', 'COMPLETED', 'REJECTED', 'OVERDUE', 'CANCELLED'
]);
export const TaskTypeSchema = z.enum([
    'BREAKING_NEWS', 'PRESS_CONF', 'INTERVIEW', 'PHOTO_ASSIGN',
    'VIDEO_ASSIGN', 'FACT_CHECK', 'FOLLOW_UP', 'CUSTOM'
]);
export const EmployeeRoleSchema = z.enum(['Journalist', 'Editor', 'Photographer', 'Manager', 'Admin']);
export const EmployeeStatusSchema = z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']);
export const AvailabilitySchema = z.enum(['AVAILABLE', 'BUSY', 'OFF_DUTY']);
export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const MessageTypeSchema = z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LOCATION', 'SYSTEM']);
export const MessageDirectionSchema = z.enum(['OUTBOUND', 'INBOUND']);
export const MessageDeliveryStatusSchema = z.enum(['SENT', 'DELIVERED', 'READ', 'FAILED']);
export const NotificationTypeSchema = z.enum([
    'TASK_ASSIGNED', 'TASK_ACCEPTED', 'TASK_COMPLETED',
    'DEADLINE_APPROACHING', 'OVERDUE', 'ESCALATION',
    'MEDIA_UPLOADED', 'SYSTEM'
]);
export const NotificationPrioritySchema = z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']);
export const NotificationStatusSchema = z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']);

// ─── Location Schema ──────────────────────────────────────────────

export const LocationSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
});

// ─── Task Schemas ─────────────────────────────────────────────────

export const TaskSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    type: TaskTypeSchema,
    priority: PrioritySchema,
    status: TaskStatusSchema,
    assignee_id: z.string().uuid().optional().nullable(),
    creator_id: z.string().uuid(),
    news_item_id: z.string().uuid().optional().nullable(),
    whatsapp_thread_id: z.string().optional().nullable(),
    location: LocationSchema.optional().nullable(),
    deadline: z.string().datetime().optional().nullable(),
    start_time: z.string().datetime().optional().nullable(),
    end_time: z.string().datetime().optional().nullable(),
    estimated_duration: z.number().int().positive().optional().nullable(),
    budget: z.number().nonnegative().optional().nullable(),
    expenses: z.array(z.object({
        id: z.string(),
        description: z.string(),
        amount: z.number().nonnegative(),
        date: z.string(),
    })).optional().nullable(),
    deliverables: z.record(z.string(), z.number().int().nonnegative()).optional().nullable(),
    created_at: z.string(),
    sent_at: z.string().optional().nullable(),
    read_at: z.string().optional().nullable(),
    accepted_at: z.string().optional().nullable(),
    started_at: z.string().optional().nullable(),
    completed_at: z.string().optional().nullable(),
    reviewed_at: z.string().optional().nullable(),
    response_time: z.number().int().nonnegative().optional().nullable(),
    completion_time: z.number().int().nonnegative().optional().nullable(),
    quality_rating: z.number().int().min(1).max(5).optional().nullable(),
    escalation_count: z.number().int().nonnegative().optional().nullable(),
    last_reminder_sent: z.string().optional().nullable(),
    notes: z.array(z.object({
        id: z.string(),
        content: z.string(),
        author_id: z.string(),
        author_name: z.string(),
        created_at: z.string(),
    })).optional().nullable(),
    versions: z.array(z.object({
        id: z.string(),
        task_snapshot: z.record(z.string(), z.any()),
        changed_fields: z.array(z.string()),
        changed_by: z.string(),
        changed_by_name: z.string(),
        changed_at: z.string(),
        change_reason: z.string().optional(),
    })).optional().nullable(),
});

export const CreateTaskSchema = TaskSchema.omit({
    id: true,
    created_at: true,
    sent_at: true,
    read_at: true,
    accepted_at: true,
    started_at: true,
    completed_at: true,
    reviewed_at: true,
    response_time: true,
    completion_time: true,
    quality_rating: true,
    escalation_count: true,
    last_reminder_sent: true,
    notes: true,
    versions: true,
});

export const UpdateTaskSchema = TaskSchema.partial().required({ id: true });

// ─── Employee Schemas ─────────────────────────────────────────────

export const EmployeeSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    email: z.string().email(),
    whatsapp_uid: z.string().optional().nullable(),
    phone_number: z.string().max(20).optional().nullable(),
    role: EmployeeRoleSchema,
    department: z.string().max(100).optional().nullable(),
    status: EmployeeStatusSchema,
    availability: AvailabilitySchema,
    approvalStatus: ApprovalStatusSchema.optional().nullable(),
    current_location: LocationSchema.optional().nullable(),
    skills: z.array(z.string()).optional().nullable(),
    performance_score: z.number().min(0).max(100).optional().nullable(),
    response_time_avg: z.number().int().nonnegative().optional().nullable(),
    total_tasks_completed: z.number().int().nonnegative().optional().nullable(),
    created_at: z.string(),
    last_active: z.string().optional().nullable(),
    manager_id: z.string().uuid().optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
    is_external: z.boolean().optional().nullable(),
    source: z.enum(['platform', 'csv', 'excel']).optional().nullable(),
});

export const CreateEmployeeSchema = EmployeeSchema.omit({
    id: true,
    created_at: true,
    performance_score: true,
    response_time_avg: true,
    total_tasks_completed: true,
});

export const UpdateEmployeeSchema = EmployeeSchema.partial().required({ id: true });

// ─── Task Message Schemas ─────────────────────────────────────────

export const TaskMessageSchema = z.object({
    id: z.string().uuid(),
    task_id: z.string().uuid(),
    sender_id: z.string().uuid(),
    sender_name: z.string().optional().nullable(),
    message_type: MessageTypeSchema,
    content: z.string().optional().nullable(),
    media_url: z.string().url().optional().nullable(),
    media_type: z.string().max(50).optional().nullable(),
    media_size: z.number().int().nonnegative().optional().nullable(),
    location: LocationSchema.optional().nullable(),
    whatsapp_message_id: z.string().optional().nullable(),
    direction: MessageDirectionSchema,
    status: MessageDeliveryStatusSchema,
    sent_at: z.string(),
    delivered_at: z.string().optional().nullable(),
    read_at: z.string().optional().nullable(),
    is_system_message: z.boolean(),
    metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export const CreateTaskMessageSchema = TaskMessageSchema.omit({
    id: true,
    sent_at: true,
    delivered_at: true,
    read_at: true,
});

// ─── Notification Schemas ────────────────────────────────────────

export const NotificationSchema = z.object({
    id: z.string().uuid(),
    recipient_id: z.string().uuid(),
    type: NotificationTypeSchema,
    priority: NotificationPrioritySchema,
    title: z.string().min(1).max(255),
    message: z.string().min(1),
    action_url: z.string().url().optional().nullable(),
    task_id: z.string().uuid().optional().nullable(),
    channels: z.array(z.string()).optional().nullable(),
    status: NotificationStatusSchema,
    created_at: z.string(),
    sent_at: z.string().optional().nullable(),
    read_at: z.string().optional().nullable(),
    expires_at: z.string().optional().nullable(),
});

export const CreateNotificationSchema = NotificationSchema.omit({
    id: true,
    created_at: true,
    sent_at: true,
    read_at: true,
});

// ─── Task Template Schemas ────────────────────────────────────────

export const TaskTemplateSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    type: TaskTypeSchema,
    description: z.string().optional().nullable(),
    default_priority: PrioritySchema,
    default_duration: z.number().int().positive().optional().nullable(),
    required_deliverables: z.record(z.string(), z.number().int().nonnegative()).optional().nullable(),
    message_template: z.string().min(1),
    is_active: z.boolean(),
    created_by: z.string().uuid(),
    created_at: z.string(),
    usage_count: z.number().int().nonnegative().optional().nullable(),
});

export const CreateTaskTemplateSchema = TaskTemplateSchema.omit({
    id: true,
    created_at: true,
    usage_count: true,
});

// ─── Performance Metrics Schemas ──────────────────────────────────

export const PerformanceMetricsSchema = z.object({
    id: z.string().uuid(),
    employee_id: z.string().uuid(),
    period_start: z.string(),
    period_end: z.string(),
    tasks_assigned: z.number().int().nonnegative(),
    tasks_accepted: z.number().int().nonnegative(),
    tasks_completed: z.number().int().nonnegative(),
    tasks_rejected: z.number().int().nonnegative(),
    tasks_overdue: z.number().int().nonnegative(),
    acceptance_rate: z.number().min(0).max(100).optional().nullable(),
    completion_rate: z.number().min(0).max(100).optional().nullable(),
    on_time_rate: z.number().min(0).max(100).optional().nullable(),
    avg_response_time: z.number().int().nonnegative().optional().nullable(),
    avg_completion_time: z.number().int().nonnegative().optional().nullable(),
    avg_quality_rating: z.number().min(0).max(5).optional().nullable(),
    total_media_uploaded: z.number().int().nonnegative().optional().nullable(),
    escalation_count: z.number().int().nonnegative().optional().nullable(),
    created_at: z.string(),
});

// ─── Settings Schemas ─────────────────────────────────────────────

export const IntegrationKeysSchema = z.object({
    whatsappNumber: z.string().optional().nullable(),
    whatsappApiKey: z.string().optional().nullable(),
    whatsappWebhookSecret: z.string().optional().nullable(),
    whatsappBusinessAccountId: z.string().optional().nullable(),
    whatsappPhoneNumberId: z.string().optional().nullable(),
    deepSeekApiKey: z.string().optional().nullable(),
});

export const SystemSettingsSchema = z.object({
    platformName: z.string().min(1).max(255),
    timezone: z.string(),
    dateFormat: z.string(),
    language: z.enum(['en', 'ar']),
    maintenanceMode: z.boolean(),
    debugMode: z.boolean(),
    twoFactorAuth: z.boolean(),
    sessionTimeout: z.number().int().min(5).max(1440),
    passwordPolicy: z.enum(['weak', 'medium', 'strong']),
    ipWhitelist: z.string().optional().nullable(),
    enableWhatsApp: z.boolean(),
    enableAI: z.boolean(),
    enableAnalytics: z.boolean(),
    enableNotifications: z.boolean(),
    integrations: IntegrationKeysSchema.optional().nullable(),
});

// ─── WhatsApp Message Schemas ─────────────────────────────────────

export const WhatsAppOutboundMessageSchema = z.object({
    to: z.string().min(1),
    type: z.enum(['text', 'template', 'interactive']),
    text: z.object({
        body: z.string().min(1),
    }).optional(),
    template: z.object({
        name: z.string(),
        language: z.object({
            code: z.string(),
        }),
        components: z.array(z.any()).optional(),
    }).optional(),
    interactive: z.object({
        type: z.enum(['button', 'list']),
        body: z.object({
            text: z.string(),
        }),
        action: z.any(),
    }).optional(),
});

export const WhatsAppWebhookPayloadSchema = z.object({
    entry: z.array(z.object({
        id: z.string(),
        changes: z.array(z.object({
            value: z.object({
                messaging_product: z.string(),
                metadata: z.object({
                    display_phone_number: z.string(),
                    phone_number_id: z.string(),
                }),
                contacts: z.array(z.object({
                    profile: z.object({
                        name: z.string().optional(),
                    }),
                    wa_id: z.string(),
                })).optional(),
                messages: z.array(z.object({
                    from: z.string(),
                    id: z.string(),
                    timestamp: z.string(),
                    type: z.string(),
                    text: z.object({
                        body: z.string(),
                    }).optional(),
                    button: z.object({
                        text: z.string(),
                        payload: z.string().optional(),
                    }).optional(),
                    location: z.object({
                        latitude: z.number(),
                        longitude: z.number(),
                        name: z.string().optional(),
                        address: z.string().optional(),
                    }).optional(),
                    image: z.object({
                        id: z.string(),
                        mime_type: z.string().optional(),
                        caption: z.string().optional(),
                    }).optional(),
                    audio: z.object({
                        id: z.string(),
                        mime_type: z.string().optional(),
                    }).optional(),
                    video: z.object({
                        id: z.string(),
                        mime_type: z.string().optional(),
                        caption: z.string().optional(),
                    }).optional(),
                    document: z.object({
                        id: z.string(),
                        mime_type: z.string().optional(),
                        filename: z.string().optional(),
                        caption: z.string().optional(),
                    }).optional(),
                    context: z.object({
                        from: z.string().optional(),
                        id: z.string().optional(),
                    }).optional(),
                })).optional(),
                statuses: z.array(z.object({
                    id: z.string(),
                    status: z.string(),
                    timestamp: z.string(),
                    recipient_id: z.string(),
                    conversation: z.any().optional(),
                    pricing: z.any().optional(),
                    errors: z.array(z.any()).optional(),
                })).optional(),
            }),
            field: z.string(),
        })),
    })),
});

// ─── Type Exports ─────────────────────────────────────────────────

export type Priority = z.infer<typeof PrioritySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type EmployeeRole = z.infer<typeof EmployeeRoleSchema>;
export type EmployeeStatus = z.infer<typeof EmployeeStatusSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type MessageDirection = z.infer<typeof MessageDirectionSchema>;
export type MessageDeliveryStatus = z.infer<typeof MessageDeliveryStatusSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
export type TaskMessage = z.infer<typeof TaskMessageSchema>;
export type CreateTaskMessage = z.infer<typeof CreateTaskMessageSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;
export type TaskTemplate = z.infer<typeof TaskTemplateSchema>;
export type CreateTaskTemplate = z.infer<typeof CreateTaskTemplateSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type IntegrationKeys = z.infer<typeof IntegrationKeysSchema>;
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;
export type WhatsAppOutboundMessage = z.infer<typeof WhatsAppOutboundMessageSchema>;
export type WhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookPayloadSchema>;
