export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'READ'
    | 'LOGIN'
    | 'LOGOUT'
    | 'STATUS_CHANGE'
    | 'ASSIGN'
    | 'REASSIGN'
    | 'COMPLETE'
    | 'APPROVE'
    | 'REJECT'
    | 'ESCALATE'
    | 'SEND_MESSAGE'
    | 'UPLOAD_MEDIA'
    | 'EXPORT'
    | 'IMPORT';

export type AuditResource =
    | 'TASK'
    | 'EMPLOYEE'
    | 'TASK_MESSAGE'
    | 'TASK_MEDIA'
    | 'NOTIFICATION'
    | 'TASK_TEMPLATE'
    | 'PERFORMANCE_METRICS'
    | 'SYSTEM_SETTINGS'
    | 'AUTH';

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditLog {
    id: string;
    action: AuditAction;
    resource: AuditResource;
    resource_id?: string;
    actor_id: string;
    actor_email: string;
    actor_name: string;
    actor_role: string;
    description: string;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    severity: AuditSeverity;
    metadata?: Record<string, unknown>;
    created_at: string;
}

export interface AuditLogFilters {
    action?: AuditAction[];
    resource?: AuditResource[];
    actor_id?: string;
    resource_id?: string;
    severity?: AuditSeverity[];
    date_range?: {
        start: string;
        end: string;
    };
    search?: string;
}

export interface AuditStats {
    total_logs: number;
    by_action: Record<AuditAction, number>;
    by_resource: Record<AuditResource, number>;
    by_severity: Record<AuditSeverity, number>;
    recent_activity: Array<{
        date: string;
        count: number;
    }>;
}
