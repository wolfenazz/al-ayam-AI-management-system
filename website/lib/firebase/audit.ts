import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/app';
import { v4 as uuidv4 } from 'uuid';
import type {
    AuditLog,
    AuditAction,
    AuditResource,
    AuditSeverity,
    AuditLogFilters,
    AuditStats,
} from '@/types/audit';

// ─── Collection Reference ─────────────────────────────────────────

export const AUDIT_COLLECTION = 'audit_logs';

// ─── Create Audit Log ──────────────────────────────────────────────

export interface CreateAuditLogInput {
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
    severity?: AuditSeverity;
    metadata?: Record<string, unknown>;
}

export async function createAuditLog(input: CreateAuditLogInput): Promise<string> {
    const timestamp = Timestamp.now();
    const auditLog: Omit<AuditLog, 'id' | 'created_at'> & { created_at: Timestamp } = {
        action: input.action,
        resource: input.resource,
        resource_id: input.resource_id,
        actor_id: input.actor_id,
        actor_email: input.actor_email,
        actor_name: input.actor_name,
        actor_role: input.actor_role,
        description: input.description,
        old_values: input.old_values,
        new_values: input.new_values,
        ip_address: input.ip_address,
        user_agent: input.user_agent,
        severity: input.severity || determineSeverity(input.action, input.resource),
        metadata: input.metadata,
        created_at: timestamp,
    };

    const docRef = await addDoc(collection(db, AUDIT_COLLECTION), {
        id: uuidv4(),
        ...auditLog,
    });

    return docRef.id;
}

// ─── Severity Determination ────────────────────────────────────────

function determineSeverity(action: AuditAction, resource: AuditResource): AuditSeverity {
    const criticalActions: AuditAction[] = ['DELETE', 'ESCALATE', 'REJECT'];
    const highActions: AuditAction[] = ['CREATE', 'ASSIGN', 'REASSIGN', 'COMPLETE', 'APPROVE'];
    const highResources: AuditResource[] = ['SYSTEM_SETTINGS', 'AUTH'];

    if (criticalActions.includes(action)) {
        return 'CRITICAL';
    }

    if (highActions.includes(action) || highResources.includes(resource)) {
        return 'HIGH';
    }

    if (action === 'UPDATE' || action === 'STATUS_CHANGE') {
        return 'MEDIUM';
    }

    return 'LOW';
}

// ─── Query Audit Logs ──────────────────────────────────────────────

export async function queryAuditLogs(filters?: AuditLogFilters, maxResults = 50): Promise<AuditLog[]> {
    const constraints: QueryConstraint[] = [];

    if (filters?.action && filters.action.length > 0) {
        constraints.push(where('action', 'in', filters.action));
    }

    if (filters?.resource && filters.resource.length > 0) {
        constraints.push(where('resource', 'in', filters.resource));
    }

    if (filters?.actor_id) {
        constraints.push(where('actor_id', '==', filters.actor_id));
    }

    if (filters?.resource_id) {
        constraints.push(where('resource_id', '==', filters.resource_id));
    }

    if (filters?.severity && filters.severity.length > 0) {
        constraints.push(where('severity', 'in', filters.severity));
    }

    if (filters?.date_range) {
        if (filters.date_range.start) {
            constraints.push(where('created_at', '>=', Timestamp.fromDate(new Date(filters.date_range.start))));
        }
        if (filters.date_range.end) {
            constraints.push(where('created_at', '<=', Timestamp.fromDate(new Date(filters.date_range.end))));
        }
    }

    constraints.push(orderBy('created_at', 'desc'));
    constraints.push(limit(maxResults));

    const q = query(collection(db, AUDIT_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        } as AuditLog;
    });
}

// ─── Get Audit Stats ───────────────────────────────────────────────

export async function getAuditStats(days = 30): Promise<AuditStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const constraints: QueryConstraint[] = [
        where('created_at', '>=', Timestamp.fromDate(startDate)),
        orderBy('created_at', 'desc'),
        limit(1000),
    ];

    const q = query(collection(db, AUDIT_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map((doc) => doc.data());

    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const recentActivity: Record<string, number> = {};

    logs.forEach((log) => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        byResource[log.resource] = (byResource[log.resource] || 0) + 1;
        bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

        const date = log.created_at?.toDate?.()?.toISOString().split('T')[0] || 'unknown';
        recentActivity[date] = (recentActivity[date] || 0) + 1;
    });

    return {
        total_logs: logs.length,
        by_action: byAction as Record<AuditAction, number>,
        by_resource: byResource as Record<AuditResource, number>,
        by_severity: bySeverity as Record<AuditSeverity, number>,
        recent_activity: Object.entries(recentActivity)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 7),
    };
}

// ─── Convenience Functions ──────────────────────────────────────────

export async function logTaskCreate(
    actor: { id: string; email: string; name: string; role: string },
    task: { id: string; title: string },
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'CREATE',
        resource: 'TASK',
        resource_id: task.id,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Created task "${task.title}"`,
        new_values: task,
        ip_address: ipAddress,
        severity: 'HIGH',
    });
}

export async function logTaskUpdate(
    actor: { id: string; email: string; name: string; role: string },
    taskId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'UPDATE',
        resource: 'TASK',
        resource_id: taskId,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Updated task ${taskId}`,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        severity: 'MEDIUM',
    });
}

export async function logTaskStatusChange(
    actor: { id: string; email: string; name: string; role: string },
    taskId: string,
    oldStatus: string,
    newStatus: string,
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'STATUS_CHANGE',
        resource: 'TASK',
        resource_id: taskId,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Task status changed from ${oldStatus} to ${newStatus}`,
        old_values: { status: oldStatus },
        new_values: { status: newStatus },
        ip_address: ipAddress,
        severity: 'MEDIUM',
    });
}

export async function logTaskAssign(
    actor: { id: string; email: string; name: string; role: string },
    taskId: string,
    assigneeId: string,
    assigneeName: string,
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'ASSIGN',
        resource: 'TASK',
        resource_id: taskId,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Assigned task to ${assigneeName}`,
        new_values: { assignee_id: assigneeId, assignee_name: assigneeName },
        ip_address: ipAddress,
        severity: 'HIGH',
    });
}

export async function logTaskDelete(
    actor: { id: string; email: string; name: string; role: string },
    taskId: string,
    taskTitle: string,
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'DELETE',
        resource: 'TASK',
        resource_id: taskId,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Deleted task "${taskTitle}"`,
        ip_address: ipAddress,
        severity: 'CRITICAL',
    });
}

export async function logEmployeeCreate(
    actor: { id: string; email: string; name: string; role: string },
    employee: { id: string; name: string; email: string; role: string },
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'CREATE',
        resource: 'EMPLOYEE',
        resource_id: employee.id,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Created employee "${employee.name}" (${employee.email})`,
        new_values: employee,
        ip_address: ipAddress,
        severity: 'HIGH',
    });
}

export async function logAuthEvent(
    action: 'LOGIN' | 'LOGOUT',
    actor: { id: string; email: string; name: string; role: string },
    ipAddress?: string,
    userAgent?: string
): Promise<string> {
    return createAuditLog({
        action,
        resource: 'AUTH',
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `User ${action.toLowerCase()}${action === 'LOGIN' ? ' successful' : ''}`,
        ip_address: ipAddress,
        user_agent: userAgent,
        severity: 'MEDIUM',
    });
}

export async function logSettingsChange(
    actor: { id: string; email: string; name: string; role: string },
    settingName: string,
    oldValue: unknown,
    newValue: unknown,
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'UPDATE',
        resource: 'SYSTEM_SETTINGS',
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Changed setting "${settingName}"`,
        old_values: { [settingName]: oldValue },
        new_values: { [settingName]: newValue },
        ip_address: ipAddress,
        severity: 'HIGH',
    });
}

export async function logMessageSend(
    actor: { id: string; email: string; name: string; role: string },
    taskId: string,
    messageType: string,
    recipient: string,
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'SEND_MESSAGE',
        resource: 'TASK_MESSAGE',
        resource_id: taskId,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Sent ${messageType} message to ${recipient}`,
        metadata: { message_type: messageType, recipient },
        ip_address: ipAddress,
        severity: 'LOW',
    });
}

export async function logMediaUpload(
    actor: { id: string; email: string; name: string; role: string },
    taskId: string,
    mediaType: string,
    fileName: string,
    fileSize: number,
    ipAddress?: string
): Promise<string> {
    return createAuditLog({
        action: 'UPLOAD_MEDIA',
        resource: 'TASK_MEDIA',
        resource_id: taskId,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Uploaded ${mediaType}: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)`,
        metadata: { media_type: mediaType, file_name: fileName, file_size: fileSize },
        ip_address: ipAddress,
        severity: 'LOW',
    });
}

export async function logEscalation(
    actor: { id: string; email: string; name: string; role: string },
    taskId: string,
    reason: string,
    severity: AuditSeverity = 'CRITICAL'
): Promise<string> {
    return createAuditLog({
        action: 'ESCALATE',
        resource: 'TASK',
        resource_id: taskId,
        actor_id: actor.id,
        actor_email: actor.email,
        actor_name: actor.name,
        actor_role: actor.role,
        description: `Task escalated: ${reason}`,
        metadata: { reason },
        severity,
    });
}
