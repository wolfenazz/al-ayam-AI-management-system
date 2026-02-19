import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { getWhatsAppConfig, getNotificationConfig } from '../config';

const db = admin.firestore();

// ─── Types ──────────────────────────────────────────────────────────

interface NotificationPayload {
    recipient_id: string;
    type: string;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
    title: string;
    message: string;
    task_id?: string;
    channels: ('dashboard' | 'email' | 'sms' | 'whatsapp' | 'push')[];
    action_url?: string;
}

interface SendResult {
    channel: string;
    success: boolean;
    error?: string;
}

// ─── Send Notification Cloud Function ─────────────────────────────────

export const sendNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { recipient_id, type, priority, title, message, task_id, channels } = data as NotificationPayload;

    if (!recipient_id || !title || !message) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    return await processNotification({
        recipient_id,
        type: type || 'SYSTEM',
        priority: priority || 'NORMAL',
        title,
        message,
        task_id,
        channels: channels || ['dashboard'],
    });
});

// ─── Send Task Notification ──────────────────────────────────────────

export const sendTaskNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { taskId, type, recipientId, additionalMessage } = data;

    if (!taskId || !type) {
        throw new functions.https.HttpsError('invalid-argument', 'Task ID and type are required');
    }

    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Task not found');
    }

    const task = taskDoc.data();
    let targetRecipientId = recipientId || task?.creator_id;

    if (!targetRecipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'No recipient specified');
    }

    const notificationTemplates: Record<string, { title: string; message: string; priority: string }> = {
        TASK_ASSIGNED: {
            title: 'New Task Assigned',
            message: `You have been assigned to "${task?.title}"`,
            priority: 'HIGH',
        },
        TASK_ACCEPTED: {
            title: 'Task Accepted',
            message: `Task "${task?.title}" has been accepted`,
            priority: 'NORMAL',
        },
        TASK_COMPLETED: {
            title: 'Task Completed',
            message: `Task "${task?.title}" has been completed`,
            priority: 'NORMAL',
        },
        DEADLINE_APPROACHING: {
            title: 'Deadline Approaching',
            message: `Task "${task?.title}" deadline is approaching`,
            priority: 'HIGH',
        },
        OVERDUE: {
            title: 'Task Overdue',
            message: `Task "${task?.title}" is now overdue`,
            priority: 'CRITICAL',
        },
    };

    const template = notificationTemplates[type] || {
        title: 'Task Update',
        message: `Update on task "${task?.title}"`,
        priority: 'NORMAL',
    };

    let finalMessage = template.message;
    if (additionalMessage) {
        finalMessage += `\n\n${additionalMessage}`;
    }

    return await processNotification({
        recipient_id: targetRecipientId,
        type,
        priority: template.priority as any,
        title: template.title,
        message: finalMessage,
        task_id: taskId,
        channels: ['dashboard', 'push'],
    });
});

// ─── Send Escalation Notification ─────────────────────────────────────

export const sendEscalationNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { taskId, reason, escalationLevel } = data;

    if (!taskId) {
        throw new functions.https.HttpsError('invalid-argument', 'Task ID is required');
    }

    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Task not found');
    }

    const task = taskDoc.data();

    const channels: NotificationPayload['channels'] = ['dashboard', 'push'];

    if (escalationLevel >= 2) {
        channels.push('email');
    }

    if (escalationLevel >= 3 || task?.priority === 'URGENT') {
        channels.push('sms');
        channels.push('whatsapp');
    }

    const priority = escalationLevel >= 3 ? 'CRITICAL' : escalationLevel >= 2 ? 'HIGH' : 'NORMAL';

    const results = [];

    if (task?.creator_id) {
        const result = await processNotification({
            recipient_id: task.creator_id,
            type: 'ESCALATION',
            priority,
            title: `🚨 Task Escalation #${escalationLevel}`,
            message: `Task "${task.title}" requires attention. Reason: ${reason}`,
            task_id: taskId,
            channels,
        });
        results.push({ recipient: 'manager', ...result });
    }

    if (task?.assignee_id) {
        const assigneeResult = await processNotification({
            recipient_id: task.assignee_id,
            type: 'SYSTEM',
            priority: 'HIGH',
            title: '⚠️ Task Escalated',
            message: `Your task "${task.title}" has been escalated. Please provide an update.`,
            task_id: taskId,
            channels: ['dashboard', 'whatsapp'],
        });
        results.push({ recipient: 'assignee', ...assigneeResult });
    }

    return { success: true, results };
});

// ─── Process Notification ─────────────────────────────────────────────

async function processNotification(payload: NotificationPayload): Promise<{ success: boolean; results: SendResult[] }> {
    const notificationRef = await db.collection('notifications').add({
        ...payload,
        status: 'PENDING',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const results: SendResult[] = [];

    for (const channel of payload.channels) {
        try {
            let result: SendResult;

            switch (channel) {
                case 'dashboard':
                    result = await sendDashboardNotification(notificationRef.id, payload);
                    break;
                case 'email':
                    result = await sendEmailNotification(payload);
                    break;
                case 'sms':
                    result = await sendSmsNotification(payload);
                    break;
                case 'whatsapp':
                    result = await sendWhatsAppNotification(payload);
                    break;
                case 'push':
                    result = await sendPushNotification(payload);
                    break;
                default:
                    result = { channel, success: false, error: 'Unknown channel' };
            }

            results.push(result);
        } catch (error) {
            results.push({
                channel,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    const allSuccess = results.every((r) => r.success);
    await notificationRef.update({
        status: allSuccess ? 'SENT' : 'PARTIAL',
        sent_at: admin.firestore.FieldValue.serverTimestamp(),
        delivery_results: results,
    });

    return { success: allSuccess, results };
}

// ─── Dashboard Notification ───────────────────────────────────────────

async function sendDashboardNotification(
    notificationId: string,
    payload: NotificationPayload
): Promise<SendResult> {
    try {
        await db.collection('user_notifications').doc(payload.recipient_id).collection('items').add({
            notification_id: notificationId,
            type: payload.type,
            priority: payload.priority,
            title: payload.title,
            message: payload.message,
            task_id: payload.task_id,
            action_url: payload.action_url,
            read: false,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { channel: 'dashboard', success: true };
    } catch (error) {
        return {
            channel: 'dashboard',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ─── Email Notification ───────────────────────────────────────────────

async function sendEmailNotification(payload: NotificationPayload): Promise<SendResult> {
    try {
        const userDoc = await db.collection('employees').doc(payload.recipient_id).get();
        const userEmail = userDoc.data()?.email;

        if (!userEmail) {
            return { channel: 'email', success: false, error: 'No email address' };
        }

        functions.logger.info('[Notification] Would send email to:', userEmail, payload.title);

        return { channel: 'email', success: true };
    } catch (error) {
        return {
            channel: 'email',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ─── SMS Notification ────────────────────────────────────────────────

async function sendSmsNotification(payload: NotificationPayload): Promise<SendResult> {
    try {
        const userDoc = await db.collection('employees').doc(payload.recipient_id).get();
        const userPhone = userDoc.data()?.phone_number;

        if (!userPhone) {
            return { channel: 'sms', success: false, error: 'No phone number' };
        }

        functions.logger.info('[Notification] Would send SMS to:', userPhone, payload.title);

        return { channel: 'sms', success: true };
    } catch (error) {
        return {
            channel: 'sms',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ─── WhatsApp Notification ────────────────────────────────────────────

async function sendWhatsAppNotification(payload: NotificationPayload): Promise<SendResult> {
    const config = getWhatsAppConfig();

    if (!config) {
        return { channel: 'whatsapp', success: false, error: 'WhatsApp not configured' };
    }

    try {
        const userDoc = await db.collection('employees').doc(payload.recipient_id).get();
        const userPhone = userDoc.data()?.phone_number;

        if (!userPhone) {
            return { channel: 'whatsapp', success: false, error: 'No phone number' };
        }

        const message = `${payload.title}\n\n${payload.message}`;

        const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

        await axios.post(
            url,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: userPhone.replace(/[^0-9]/g, ''),
                type: 'text',
                text: { body: message },
            },
            {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return { channel: 'whatsapp', success: true };
    } catch (error) {
        return {
            channel: 'whatsapp',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ─── Push Notification ────────────────────────────────────────────────

async function sendPushNotification(payload: NotificationPayload): Promise<SendResult> {
    try {
        const tokensSnapshot = await db
            .collection('users')
            .doc(payload.recipient_id)
            .collection('fcm_tokens')
            .get();

        if (tokensSnapshot.empty) {
            return { channel: 'push', success: false, error: 'No FCM tokens' };
        }

        const tokens = tokensSnapshot.docs.map((doc) => doc.id);

        const message: admin.messaging.MulticastMessage = {
            tokens,
            notification: {
                title: payload.title,
                body: payload.message,
            },
            data: {
                type: payload.type,
                priority: payload.priority,
                task_id: payload.task_id || '',
                action_url: payload.action_url || '',
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        functions.logger.info('[Notification] Push sent:', {
            successCount: response.successCount,
            failureCount: response.failureCount,
        });

        return {
            channel: 'push',
            success: response.successCount > 0,
        };
    } catch (error) {
        return {
            channel: 'push',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
