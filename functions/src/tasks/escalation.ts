import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getEscalationSettings } from '../config';

const db = admin.firestore();

// ─── Scheduled Escalation Check ──────────────────────────────────────

export const scheduledEscalationCheck = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async (context) => {
        functions.logger.info('[Escalation] Starting scheduled escalation check');

        const settings = getEscalationSettings();

        try {
            await checkUnacceptedTasks(settings);
            await checkOverdueTasks(settings);
            await checkApproachingDeadlines(settings);

            functions.logger.info('[Escalation] Escalation check completed');
        } catch (error) {
            functions.logger.error('[Escalation] Error during escalation check', { error });
        }
    });

// ─── Check Overdue Tasks ─────────────────────────────────────────────

export const checkOverdueTasks = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const settings = getEscalationSettings();
    const overdueTasks = await findOverdueTasks();

    const results = [];
    for (const task of overdueTasks) {
        const result = await escalateTask(task.id, 'OVERDUE');
        results.push({ taskId: task.id, ...result });
    }

    return {
        success: true,
        escalatedCount: results.length,
        results,
    };
});

// ─── Escalate Task ───────────────────────────────────────────────────

export const escalateTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { taskId, reason } = data;

    if (!taskId) {
        throw new functions.https.HttpsError('invalid-argument', 'Task ID is required');
    }

    return await performEscalation(taskId, reason || 'MANUAL_ESCALATION', context.auth.uid);
});

// ─── Find Overdue Tasks ──────────────────────────────────────────────

async function findOverdueTasks(): Promise<any[]> {
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db
        .collection('tasks')
        .where('status', 'in', ['ACCEPTED', 'IN_PROGRESS', 'SENT', 'READ'])
        .where('deadline', '<', now)
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ─── Check Unaccepted Tasks ──────────────────────────────────────────

async function checkUnacceptedTasks(settings: any): Promise<void> {
    const now = Date.now();

    const snapshot = await db
        .collection('tasks')
        .where('status', '==', 'SENT')
        .get();

    for (const doc of snapshot.docs) {
        const task = doc.data();
        const sentAt = task.sent_at?.toDate?.()?.getTime() || task.sent_at?._seconds * 1000;

        if (!sentAt) continue;

        const minutesSinceSent = (now - sentAt) / (1000 * 60);
        const lastReminder = task.last_reminder_sent?.toDate?.()?.getTime() || 0;

        if (
            minutesSinceSent >= settings.escalationMinutes &&
            lastReminder < now - settings.secondReminderMinutes * 60 * 1000
        ) {
            await performEscalation(doc.id, 'NOT_ACCEPTED', 'system');
        } else if (
            minutesSinceSent >= settings.secondReminderMinutes &&
            lastReminder < now - settings.firstReminderMinutes * 60 * 1000
        ) {
            await sendReminder(doc.id, 'second', task);
        } else if (
            minutesSinceSent >= settings.firstReminderMinutes &&
            !lastReminder
        ) {
            await sendReminder(doc.id, 'first', task);
        }
    }
}

// ─── Check Overdue Tasks (Internal) ──────────────────────────────────

async function checkOverdueTasksInternal(settings: any): Promise<void> {
    const overdueTasks = await findOverdueTasks();

    for (const task of overdueTasks) {
        const currentStatus = task.status;

        if (currentStatus !== 'OVERDUE') {
            await db.collection('tasks').doc(task.id).update({
                status: 'OVERDUE',
                escalation_count: admin.firestore.FieldValue.increment(1),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });

            await performEscalation(task.id, 'DEADLINE_PASSED', 'system');
        }
    }
}

// ─── Check Approaching Deadlines ─────────────────────────────────────

async function checkApproachingDeadlines(settings: any): Promise<void> {
    const now = Date.now();
    const percentages = settings.deadlineWarningPercentages || [50, 25, 10];

    for (const percentage of percentages) {
        const snapshot = await db
            .collection('tasks')
            .where('status', '==', 'IN_PROGRESS')
            .get();

        for (const doc of snapshot.docs) {
            const task = doc.data();
            const deadline = task.deadline?.toDate?.()?.getTime() || task.deadline?._seconds * 1000;
            const startedAt = task.started_at?.toDate?.()?.getTime() || task.accepted_at?.toDate?.()?.getTime();

            if (!deadline || !startedAt) continue;

            const totalDuration = deadline - startedAt;
            const timeRemaining = deadline - now;
            const remainingPercentage = (timeRemaining / totalDuration) * 100;

            if (
                remainingPercentage <= percentage &&
                remainingPercentage > percentage - 5
            ) {
                const lastReminder = task.deadline_warning_sent || 0;
                if (lastReminder < percentage) {
                    await sendDeadlineWarning(doc.id, percentage, task);
                    await db.collection('tasks').doc(doc.id).update({
                        deadline_warning_sent: percentage,
                    });
                }
            }
        }
    }
}

// ─── Perform Escalation ───────────────────────────────────────────────

async function performEscalation(
    taskId: string,
    reason: string,
    actorId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();
        if (!taskDoc.exists) {
            return { success: false, message: 'Task not found' };
        }

        const task = taskDoc.data();

        const escalationCount = (task?.escalation_count || 0) + 1;

        await taskDoc.ref.update({
            escalation_count: escalationCount,
            last_escalation_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (task?.creator_id) {
            await createEscalationNotification(task, reason, escalationCount);
        }

        if (task?.assignee_id) {
            await notifyAssigneeOfEscalation(task, reason);
        }

        await db.collection('audit_logs').add({
            action: 'ESCALATE',
            resource: 'TASK',
            resource_id: taskId,
            actor_id: actorId,
            description: `Task escalated: ${reason}`,
            metadata: {
                reason,
                escalation_count: escalationCount,
                task_title: task?.title,
            },
            severity: 'CRITICAL',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info('[Escalation] Task escalated', {
            taskId,
            reason,
            escalationCount,
        });

        return { success: true, message: 'Task escalated successfully' };
    } catch (error) {
        functions.logger.error('[Escalation] Error escalating task', { error, taskId });
        return { success: false, message: 'Failed to escalate task' };
    }
}

// ─── Send Reminder ───────────────────────────────────────────────────

async function sendReminder(
    taskId: string,
    level: 'first' | 'second',
    task: any
): Promise<void> {
    const assigneeId = task.assignee_id;
    if (!assigneeId) return;

    const reminderMessages = {
        first: `📋 Reminder: You have a pending task "${task.title}". Please accept or decline.`,
        second: `⚠️ URGENT Reminder: Task "${task.title}" is still pending. Please respond immediately.`,
    };

    await db.collection('notifications').add({
        recipient_id: assigneeId,
        type: 'SYSTEM',
        priority: level === 'second' ? 'HIGH' : 'NORMAL',
        title: level === 'second' ? 'Urgent Task Reminder' : 'Task Reminder',
        message: reminderMessages[level],
        task_id: taskId,
        status: 'PENDING',
        channels: ['dashboard', 'whatsapp'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('tasks').doc(taskId).update({
        last_reminder_sent: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (level === 'second' && task.creator_id) {
        await db.collection('notifications').add({
            recipient_id: task.creator_id,
            type: 'ESCALATION',
            priority: 'HIGH',
            title: 'Task Not Accepted',
            message: `Task "${task.title}" has not been accepted. Employee has been reminded.`,
            task_id: taskId,
            status: 'PENDING',
            channels: ['dashboard'],
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
}

// ─── Send Deadline Warning ───────────────────────────────────────────

async function sendDeadlineWarning(
    taskId: string,
    percentage: number,
    task: any
): Promise<void> {
    const assigneeId = task.assignee_id;
    if (!assigneeId) return;

    await db.collection('notifications').add({
        recipient_id: assigneeId,
        type: 'DEADLINE_APPROACHING',
        priority: percentage <= 15 ? 'HIGH' : 'NORMAL',
        title: 'Deadline Approaching',
        message: `⚠️ Task "${task.title}" deadline is approaching (${percentage}% time remaining). Please complete soon.`,
        task_id: taskId,
        status: 'PENDING',
        channels: ['dashboard', 'whatsapp'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ─── Create Escalation Notification ──────────────────────────────────

async function createEscalationNotification(
    task: any,
    reason: string,
    escalationCount: number
): Promise<void> {
    const priority = escalationCount >= 3 ? 'CRITICAL' : 'HIGH';

    await db.collection('notifications').add({
        recipient_id: task.creator_id,
        type: 'ESCALATION',
        priority,
        title: `Task Escalation #${escalationCount}`,
        message: `🚨 Task "${task.title}" has been escalated. Reason: ${reason}`,
        task_id: task.id,
        status: 'PENDING',
        channels: ['dashboard', 'email', 'sms'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ─── Notify Assignee of Escalation ───────────────────────────────────

async function notifyAssigneeOfEscalation(task: any, reason: string): Promise<void> {
    await db.collection('notifications').add({
        recipient_id: task.assignee_id,
        type: 'SYSTEM',
        priority: 'HIGH',
        title: 'Task Escalated',
        message: `Your task "${task.title}" has been escalated due to: ${reason}. Please provide an update.`,
        task_id: task.id,
        status: 'PENDING',
        channels: ['dashboard', 'whatsapp'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}
