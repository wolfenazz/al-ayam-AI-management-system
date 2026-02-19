import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ─── On Task Create Trigger ───────────────────────────────────────────

export const onTaskCreate = functions.firestore
    .document('tasks/{taskId}')
    .onCreate(async (snapshot, context) => {
        const task = snapshot.data();
        const taskId = context.params.taskId;

        functions.logger.info('[Trigger] Task created', { taskId, title: task.title });

        try {
            // Create audit log
            await db.collection('audit_logs').add({
                action: 'CREATE',
                resource: 'TASK',
                resource_id: taskId,
                actor_id: task.creator_id,
                description: `Created task "${task.title}"`,
                new_values: task,
                severity: 'HIGH',
                created_at: admin.firestore.FieldValue.serverTimestamp(),
            });

            // If task has an assignee, send notification
            if (task.assignee_id && task.status === 'SENT') {
                await sendTaskAssignedNotification(taskId, task);
            }

            // Update task count for dashboard stats
            await updateTaskStats(task.status);
        } catch (error) {
            functions.logger.error('[Trigger] Error in onTaskCreate', { error, taskId });
        }
    });

// ─── On Task Update Trigger ───────────────────────────────────────────

export const onTaskUpdate = functions.firestore
    .document('tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const taskId = context.params.taskId;

        functions.logger.info('[Trigger] Task updated', {
            taskId,
            statusChange: `${before.status} -> ${after.status}`,
        });

        try {
            // Track what changed
            const changedFields: string[] = [];
            for (const key of Object.keys(after)) {
                if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
                    changedFields.push(key);
                }
            }

            // Create audit log for significant changes
            if (changedFields.length > 0) {
                await db.collection('audit_logs').add({
                    action: 'UPDATE',
                    resource: 'TASK',
                    resource_id: taskId,
                    actor_id: after.updated_by || 'system',
                    description: `Updated task "${after.title}"`,
                    old_values: extractChangedFields(before, changedFields),
                    new_values: extractChangedFields(after, changedFields),
                    metadata: { changed_fields: changedFields },
                    severity: changedFields.includes('status') ? 'HIGH' : 'MEDIUM',
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            // Handle status changes
            if (before.status !== after.status) {
                await handleStatusChange(taskId, before.status, after.status, after);
            }

            // Handle assignment changes
            if (before.assignee_id !== after.assignee_id && after.assignee_id) {
                await handleAssignmentChange(taskId, before.assignee_id, after.assignee_id, after);
            }

            // Update task stats
            if (before.status !== after.status) {
                await updateTaskStats(before.status, -1);
                await updateTaskStats(after.status, 1);
            }
        } catch (error) {
            functions.logger.error('[Trigger] Error in onTaskUpdate', { error, taskId });
        }
    });

// ─── On Message Create Trigger ─────────────────────────────────────────

export const onMessageCreate = functions.firestore
    .document('task_messages/{messageId}')
    .onCreate(async (snapshot, context) => {
        const message = snapshot.data();
        const messageId = context.params.messageId;

        functions.logger.info('[Trigger] Message created', { messageId, taskId: message.task_id });

        try {
            // If this is an inbound message, notify the manager
            if (message.direction === 'INBOUND' && message.task_id) {
                const taskDoc = await db.collection('tasks').doc(message.task_id).get();
                const task = taskDoc.data();

                if (task?.creator_id) {
                    await db.collection('notifications').add({
                        recipient_id: task.creator_id,
                        type: 'SYSTEM',
                        priority: 'NORMAL',
                        title: 'New Message Received',
                        message: `New message for task "${task.title}"`,
                        task_id: message.task_id,
                        status: 'PENDING',
                        channels: ['dashboard'],
                        created_at: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }

            // Create audit log
            await db.collection('audit_logs').add({
                action: 'SEND_MESSAGE',
                resource: 'TASK_MESSAGE',
                resource_id: message.task_id,
                actor_id: message.sender_id,
                description: `Sent ${message.message_type} message`,
                metadata: {
                    message_type: message.message_type,
                    direction: message.direction,
                },
                severity: 'LOW',
                created_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            functions.logger.error('[Trigger] Error in onMessageCreate', { error, messageId });
        }
    });

// ─── Handle Status Change ─────────────────────────────────────────────

async function handleStatusChange(
    taskId: string,
    oldStatus: string,
    newStatus: string,
    task: any
): Promise<void> {
    const notifications: Array<{ recipientId: string; title: string; message: string; priority: string }> = [];

    switch (newStatus) {
        case 'ACCEPTED':
            if (task.creator_id) {
                notifications.push({
                    recipientId: task.creator_id,
                    title: 'Task Accepted',
                    message: `Task "${task.title}" has been accepted`,
                    priority: 'NORMAL',
                });
            }
            break;

        case 'COMPLETED':
            if (task.creator_id) {
                notifications.push({
                    recipientId: task.creator_id,
                    title: 'Task Completed',
                    message: `Task "${task.title}" has been completed and awaits review`,
                    priority: 'NORMAL',
                });
            }
            break;

        case 'REVIEW':
            if (task.creator_id) {
                notifications.push({
                    recipientId: task.creator_id,
                    title: 'Task Ready for Review',
                    message: `Task "${task.title}" is ready for your review`,
                    priority: 'HIGH',
                });
            }
            break;

        case 'OVERDUE':
            if (task.creator_id) {
                notifications.push({
                    recipientId: task.creator_id,
                    title: '🚨 Task Overdue',
                    message: `Task "${task.title}" is now overdue`,
                    priority: 'CRITICAL',
                });
            }
            if (task.assignee_id) {
                notifications.push({
                    recipientId: task.assignee_id,
                    title: '⚠️ Task Overdue',
                    message: `Your task "${task.title}" is overdue. Please provide an update.`,
                    priority: 'HIGH',
                });
            }
            break;
    }

    for (const notif of notifications) {
        await db.collection('notifications').add({
            recipient_id: notif.recipientId,
            type: 'SYSTEM',
            priority: notif.priority,
            title: notif.title,
            message: notif.message,
            task_id: taskId,
            status: 'PENDING',
            channels: ['dashboard', 'push'],
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
}

// ─── Handle Assignment Change ─────────────────────────────────────────

async function handleAssignmentChange(
    taskId: string,
    oldAssigneeId: string | undefined,
    newAssigneeId: string,
    task: any
): Promise<void> {
    const newAssigneeDoc = await db.collection('employees').doc(newAssigneeId).get();
    const newAssignee = newAssigneeDoc.data();

    if (!newAssignee) return;

    // Create audit log
    await db.collection('audit_logs').add({
        action: 'ASSIGN',
        resource: 'TASK',
        resource_id: taskId,
        actor_id: task.updated_by || 'system',
        description: `Task assigned to ${newAssignee.name}`,
        old_values: oldAssigneeId ? { assignee_id: oldAssigneeId } : undefined,
        new_values: { assignee_id: newAssigneeId, assignee_name: newAssignee.name },
        severity: 'HIGH',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send notification to new assignee
    await db.collection('notifications').add({
        recipient_id: newAssigneeId,
        type: 'TASK_ASSIGNED',
        priority: task.priority === 'URGENT' ? 'CRITICAL' : task.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
        title: '📋 New Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        task_id: taskId,
        status: 'PENDING',
        channels: ['dashboard', 'push'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ─── Send Task Assigned Notification ──────────────────────────────────

async function sendTaskAssignedNotification(taskId: string, task: any): Promise<void> {
    if (!task.assignee_id) return;

    const assigneeDoc = await db.collection('employees').doc(task.assignee_id).get();
    const assignee = assigneeDoc.data();

    if (!assignee) return;

    await db.collection('notifications').add({
        recipient_id: task.assignee_id,
        type: 'TASK_ASSIGNED',
        priority: task.priority === 'URGENT' ? 'CRITICAL' : task.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
        title: '📋 New Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        task_id: taskId,
        status: 'PENDING',
        channels: ['dashboard', 'push', 'whatsapp'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ─── Update Task Stats ────────────────────────────────────────────────

async function updateTaskStats(status: string, delta: number = 1): Promise<void> {
    const statsRef = db.collection('stats').doc('tasks');

    const updateField = `by_status.${status.toLowerCase()}`;

    await statsRef.set(
        {
            [updateField]: admin.firestore.FieldValue.increment(delta),
            total: admin.firestore.FieldValue.increment(delta),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );
}

// ─── Extract Changed Fields ───────────────────────────────────────────

function extractChangedFields(data: any, fields: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const field of fields) {
        if (data[field] !== undefined) {
            result[field] = data[field];
        }
    }
    return result;
}
