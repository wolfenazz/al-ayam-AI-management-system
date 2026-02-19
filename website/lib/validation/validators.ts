import { z } from 'zod';
import {
    TaskSchema,
    CreateTaskSchema,
    UpdateTaskSchema,
    EmployeeSchema,
    CreateEmployeeSchema,
    UpdateEmployeeSchema,
    TaskMessageSchema,
    CreateTaskMessageSchema,
    NotificationSchema,
    CreateNotificationSchema,
    TaskTemplateSchema,
    CreateTaskTemplateSchema,
    SystemSettingsSchema,
    WhatsAppWebhookPayloadSchema,
} from './schemas';

// ─── Validation Result Type ───────────────────────────────────────

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
    errorMessage?: string;
}

// ─── Generic Validation Function ───────────────────────────────────

function validateWithSchema<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error,
        errorMessage: formatZodErrors(result.error),
    };
}

// ─── Error Formatting ──────────────────────────────────────────────

export function formatZodErrors(error: z.ZodError): string {
    return error.issues
        .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
}

// ─── Task Validation ───────────────────────────────────────────────

export function validateTask(data: unknown): ValidationResult<z.infer<typeof TaskSchema>> {
    return validateWithSchema(TaskSchema, data);
}

export function validateCreateTask(data: unknown): ValidationResult<z.infer<typeof CreateTaskSchema>> {
    return validateWithSchema(CreateTaskSchema, data);
}

export function validateUpdateTask(data: unknown): ValidationResult<z.infer<typeof UpdateTaskSchema>> {
    return validateWithSchema(UpdateTaskSchema, data);
}

// ─── Employee Validation ───────────────────────────────────────────

export function validateEmployee(data: unknown): ValidationResult<z.infer<typeof EmployeeSchema>> {
    return validateWithSchema(EmployeeSchema, data);
}

export function validateCreateEmployee(data: unknown): ValidationResult<z.infer<typeof CreateEmployeeSchema>> {
    return validateWithSchema(CreateEmployeeSchema, data);
}

export function validateUpdateEmployee(data: unknown): ValidationResult<z.infer<typeof UpdateEmployeeSchema>> {
    return validateWithSchema(UpdateEmployeeSchema, data);
}

// ─── Task Message Validation ───────────────────────────────────────

export function validateTaskMessage(data: unknown): ValidationResult<z.infer<typeof TaskMessageSchema>> {
    return validateWithSchema(TaskMessageSchema, data);
}

export function validateCreateTaskMessage(data: unknown): ValidationResult<z.infer<typeof CreateTaskMessageSchema>> {
    return validateWithSchema(CreateTaskMessageSchema, data);
}

// ─── Notification Validation ───────────────────────────────────────

export function validateNotification(data: unknown): ValidationResult<z.infer<typeof NotificationSchema>> {
    return validateWithSchema(NotificationSchema, data);
}

export function validateCreateNotification(data: unknown): ValidationResult<z.infer<typeof CreateNotificationSchema>> {
    return validateWithSchema(CreateNotificationSchema, data);
}

// ─── Task Template Validation ──────────────────────────────────────

export function validateTaskTemplate(data: unknown): ValidationResult<z.infer<typeof TaskTemplateSchema>> {
    return validateWithSchema(TaskTemplateSchema, data);
}

export function validateCreateTaskTemplate(data: unknown): ValidationResult<z.infer<typeof CreateTaskTemplateSchema>> {
    return validateWithSchema(CreateTaskTemplateSchema, data);
}

// ─── Settings Validation ───────────────────────────────────────────

export function validateSystemSettings(data: unknown): ValidationResult<z.infer<typeof SystemSettingsSchema>> {
    return validateWithSchema(SystemSettingsSchema, data);
}

// ─── WhatsApp Validation ───────────────────────────────────────────

export function validateWhatsAppWebhook(data: unknown): ValidationResult<z.infer<typeof WhatsAppWebhookPayloadSchema>> {
    return validateWithSchema(WhatsAppWebhookPayloadSchema, data);
}

// ─── Custom Business Logic Validators ──────────────────────────────

export function validateTaskAssignment(
    task: { assignee_id?: string | null; status: string },
    employee: { availability: string; status: string } | null
): ValidationResult<void> {
    if (!task.assignee_id) {
        return { success: true };
    }

    if (!employee) {
        return {
            success: false,
            errorMessage: 'Assigned employee not found',
        };
    }

    if (employee.status !== 'ACTIVE') {
        return {
            success: false,
            errorMessage: 'Cannot assign task to inactive employee',
        };
    }

    if (employee.availability === 'OFF_DUTY') {
        return {
            success: false,
            errorMessage: 'Cannot assign task to employee who is off duty',
        };
    }

    return { success: true };
}

export function validateTaskStatusTransition(
    currentStatus: string,
    newStatus: string
): ValidationResult<void> {
    const validTransitions: Record<string, string[]> = {
        'DRAFT': ['SENT', 'CANCELLED'],
        'SENT': ['READ', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
        'READ': ['ACCEPTED', 'REJECTED', 'CANCELLED'],
        'ACCEPTED': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['REVIEW', 'COMPLETED', 'OVERDUE', 'CANCELLED'],
        'REVIEW': ['COMPLETED', 'REJECTED', 'IN_PROGRESS'],
        'COMPLETED': [],
        'REJECTED': ['DRAFT', 'CANCELLED'],
        'OVERDUE': ['IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'],
        'CANCELLED': [],
    };

    const allowedNextStatuses = validTransitions[currentStatus] || [];

    if (!allowedNextStatuses.includes(newStatus)) {
        return {
            success: false,
            errorMessage: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        };
    }

    return { success: true };
}

export function validateDeadline(
    deadline: string | undefined | null,
    createdAt: string
): ValidationResult<void> {
    if (!deadline) {
        return { success: true };
    }

    const deadlineDate = new Date(deadline);
    const createdDate = new Date(createdAt);

    if (isNaN(deadlineDate.getTime())) {
        return {
            success: false,
            errorMessage: 'Invalid deadline date format',
        };
    }

    if (deadlineDate <= createdDate) {
        return {
            success: false,
            errorMessage: 'Deadline must be after creation date',
        };
    }

    return { success: true };
}

export function validateBudget(
    budget: number | undefined | null,
    expenses: { amount: number }[] | undefined | null
): ValidationResult<void> {
    if (!budget) {
        return { success: true };
    }

    if (budget < 0) {
        return {
            success: false,
            errorMessage: 'Budget cannot be negative',
        };
    }

    if (expenses && expenses.length > 0) {
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        if (totalExpenses > budget) {
            return {
                success: false,
                errorMessage: `Total expenses (${totalExpenses}) exceed budget (${budget})`,
            };
        }
    }

    return { success: true };
}

// ─── Sanitization Helpers ──────────────────────────────────────────

export function sanitizeString(value: string | undefined | null): string {
    if (!value) return '';
    return value.trim().replace(/<[^>]*>/g, '');
}

export function sanitizePhoneNumber(phone: string): string {
    return phone.replace(/[^0-9+]/g, '');
}

export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

// ─── Collection-Specific Validators ────────────────────────────────

export const COLLECTION_VALIDATORS = {
    tasks: {
        create: validateCreateTask,
        update: validateUpdateTask,
    },
    employees: {
        create: validateCreateEmployee,
        update: validateUpdateEmployee,
    },
    task_messages: {
        create: validateCreateTaskMessage,
    },
    notifications: {
        create: validateCreateNotification,
    },
    task_templates: {
        create: validateCreateTaskTemplate,
    },
} as const;
