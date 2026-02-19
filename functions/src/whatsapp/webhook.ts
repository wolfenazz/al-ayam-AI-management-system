import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { getWhatsAppConfig } from '../config';

const db = admin.firestore();

// ─── Types ──────────────────────────────────────────────────────────

interface WebhookPayload {
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts?: Array<{
                    profile: { name?: string };
                    wa_id: string;
                }>;
                messages?: Array<{
                    from: string;
                    id: string;
                    timestamp: string;
                    type: string;
                    text?: { body: string };
                    button?: { text: string; payload?: string };
                    location?: {
                        latitude: number;
                        longitude: number;
                        name?: string;
                        address?: string;
                    };
                    image?: { id: string; mime_type?: string; caption?: string };
                    audio?: { id: string; mime_type?: string };
                    video?: { id: string; mime_type?: string; caption?: string };
                    document?: { id: string; mime_type?: string; filename?: string; caption?: string };
                    context?: { from?: string; id?: string };
                }>;
                statuses?: Array<{
                    id: string;
                    status: string;
                    timestamp: string;
                    recipient_id: string;
                }>;
            };
            field: string;
        }>;
    }>;
}

// ─── WhatsApp Webhook Handler ───────────────────────────────────────

export const whatsappWebhook = functions.https.onRequest(async (request, response) => {
    const config = getWhatsAppConfig();

    // Handle webhook verification
    if (request.method === 'GET') {
        const mode = request.query['hub.mode'];
        const token = request.query['hub.verify_token'];
        const challenge = request.query['hub.challenge'];

        if (mode === 'subscribe' && token === config?.webhookVerifyToken) {
            functions.logger.info('[WhatsApp] Webhook verified successfully');
            response.status(200).send(challenge);
            return;
        }

        functions.logger.warn('[WhatsApp] Webhook verification failed');
        response.status(403).json({ error: 'Verification failed' });
        return;
    }

    // Handle incoming webhook
    if (request.method === 'POST') {
        try {
            const payload = request.body as WebhookPayload;
            functions.logger.info('[WhatsApp] Webhook received', { payload });

            if (!payload.entry || payload.entry.length === 0) {
                response.status(200).json({ status: 'no entries' });
                return;
            }

            for (const entry of payload.entry) {
                for (const change of entry.changes) {
                    if (change.field === 'messages') {
                        await handleMessagesChange(change.value, config);
                    }
                }
            }

            response.status(200).json({ status: 'success' });
        } catch (error) {
            functions.logger.error('[WhatsApp] Webhook error', { error });
            response.status(500).json({ error: 'Internal server error' });
        }
        return;
    }

    response.status(405).json({ error: 'Method not allowed' });
});

// ─── Message Handler ─────────────────────────────────────────────────

async function handleMessagesChange(value: any, config: any) {
    const { messages, statuses, contacts } = value;

    // Handle status updates
    if (statuses && statuses.length > 0) {
        for (const status of statuses) {
            await handleStatusUpdate(status);
        }
    }

    // Handle incoming messages
    if (messages && messages.length > 0) {
        for (const message of messages) {
            await handleIncomingMessage(message, contacts, config);
        }
    }
}

// ─── Status Update Handler ───────────────────────────────────────────

async function handleStatusUpdate(status: any) {
    const { id: messageId, status: messageStatus, timestamp } = status;

    try {
        const messagesSnapshot = await db
            .collection('task_messages')
            .where('whatsapp_message_id', '==', messageId)
            .limit(1)
            .get();

        if (messagesSnapshot.empty) {
            return;
        }

        const messageDoc = messagesSnapshot.docs[0];
        const updateData: any = { status: messageStatus.toUpperCase() };

        if (messageStatus === 'delivered') {
            updateData.delivered_at = new Date(parseInt(timestamp) * 1000);
        } else if (messageStatus === 'read') {
            updateData.read_at = new Date(parseInt(timestamp) * 1000);
        }

        await messageDoc.ref.update(updateData);

        // Update task read_at if this is an outbound message
        const messageData = messageDoc.data();
        if (messageData.task_id && messageStatus === 'read' && messageData.direction === 'OUTBOUND') {
            await db.collection('tasks').doc(messageData.task_id).update({
                read_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    } catch (error) {
        functions.logger.error('[WhatsApp] Error updating message status', { error, messageId });
    }
}

// ─── Incoming Message Handler ────────────────────────────────────────

async function handleIncomingMessage(message: any, contacts: any[], config: any) {
    const senderPhone = message.from;
    const contact = contacts?.find((c) => c.wa_id === senderPhone);
    const senderName = contact?.profile?.name || 'Unknown';

    functions.logger.info('[WhatsApp] Processing message', {
        from: senderPhone,
        type: message.type,
        senderName,
    });

    try {
        // Find employee by phone number
        const employeesSnapshot = await db
            .collection('employees')
            .where('phone_number', '==', senderPhone)
            .limit(1)
            .get();

        if (employeesSnapshot.empty) {
            functions.logger.warn('[WhatsApp] Unknown sender', { senderPhone });
            return;
        }

        const employee = employeesSnapshot.docs[0].data();
        const employeeId = employeesSnapshot.docs[0].id;

        // Parse message content
        const parsedAction = await parseMessageContent(message);

        // Handle task action if present
        if (parsedAction && parsedAction.type !== 'UNKNOWN') {
            await handleTaskAction(parsedAction, employee, employeeId);
        }

        // Store the message
        await storeIncomingMessage(message, employeeId, employee, parsedAction);

        // Mark as read
        await markMessageAsRead(message.id, config);
    } catch (error) {
        functions.logger.error('[WhatsApp] Error handling message', { error, message });
    }
}

// ─── Parse Message Content ───────────────────────────────────────────

async function parseMessageContent(message: any): Promise<any> {
    const type = message.type;

    if (type === 'text' && message.text?.body) {
        return parseTextMessage(message.text.body);
    }

    if (type === 'button' && message.button?.payload) {
        return parseButtonResponse(message.button.payload);
    }

    if (type === 'location') {
        return {
            type: 'LOCATION_UPDATE',
            location: {
                lat: message.location.latitude,
                lng: message.location.longitude,
                address: message.location.address,
            },
        };
    }

    if (['image', 'video', 'audio', 'document'].includes(type)) {
        return {
            type: 'MEDIA_UPLOADED',
            mediaId: message[type]?.id,
            mediaType: type,
            caption: message[type]?.caption,
        };
    }

    return { type: 'UNKNOWN' };
}

// ─── Parse Text Message ──────────────────────────────────────────────

function parseTextMessage(text: string): any {
    const lowerText = text.toLowerCase();

    // Extract task ID
    const taskIdMatch = text.match(/#([A-Z0-9]{8})/i);
    const taskId = taskIdMatch ? taskIdMatch[1] : null;

    // Check for keywords
    if (/(accept|confirm|yes|sure|okay|ok|on it|will do|got it)/i.test(text)) {
        return { type: 'ACCEPT', taskId };
    }
    if (/(decline|reject|no|cannot|can't|won't|unable|not available)/i.test(text)) {
        return { type: 'DECLINE', taskId };
    }
    if (/(done|finished|completed|complete|wrapped up)/i.test(text)) {
        return { type: 'DONE', taskId };
    }
    if (/(started|beginning|working on|in progress)/i.test(text)) {
        return { type: 'STARTED', taskId };
    }
    if (/(on my way|on the way|heading there|en route)/i.test(text)) {
        return { type: 'ON_WAY', taskId };
    }
    if (/(arrived|here|at the location|on site)/i.test(text)) {
        return { type: 'ARRIVED', taskId };
    }
    if (/(running late|will be late|delayed|need more time)/i.test(text)) {
        return { type: 'DELAY', taskId };
    }
    if (/(issue|problem|trouble|blocked|can't access)/i.test(text)) {
        return { type: 'ISSUE', taskId, description: text };
    }

    return { type: 'UNKNOWN', rawText: text };
}

// ─── Parse Button Response ───────────────────────────────────────────

function parseButtonResponse(payload: string): any {
    const parts = payload.split('_');
    if (parts.length < 2) return { type: 'UNKNOWN' };

    const action = parts[0];
    const taskId = parts.slice(1).join('_');

    const actionMap: Record<string, string> = {
        accept: 'ACCEPT',
        decline: 'DECLINE',
        started: 'STARTED',
        onway: 'ON_WAY',
        arrived: 'ARRIVED',
        done: 'DONE',
        delay: 'DELAY',
        issue: 'ISSUE',
    };

    return {
        type: actionMap[action] || 'UNKNOWN',
        taskId,
    };
}

// ─── Task Action Handler ─────────────────────────────────────────────

async function handleTaskAction(action: any, employee: any, employeeId: string) {
    const taskId = action.taskId;

    if (!taskId || taskId === 'unknown') {
        functions.logger.warn('[WhatsApp] Cannot process action without task ID');
        return;
    }

    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();

        if (!taskDoc.exists) {
            functions.logger.warn('[WhatsApp] Task not found', { taskId });
            return;
        }

        const task = taskDoc.data();

        if (task?.assignee_id !== employeeId) {
            functions.logger.warn('[WhatsApp] Task not assigned to this employee', {
                taskId,
                employeeId,
            });
            return;
        }

        // Update task status based on action
        const statusMap: Record<string, string> = {
            ACCEPT: 'ACCEPTED',
            DECLINE: 'REJECTED',
            STARTED: 'IN_PROGRESS',
            ON_WAY: 'IN_PROGRESS',
            ARRIVED: 'IN_PROGRESS',
            DONE: 'COMPLETED',
            ISSUE: 'REVIEW',
        };

        const newStatus = statusMap[action.type];
        if (!newStatus) {
            functions.logger.info('[WhatsApp] No status change for action', { action: action.type });
            return;
        }

        const updateData: any = {
            status: newStatus,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Add timestamps based on action
        if (action.type === 'ACCEPT') {
            updateData.accepted_at = admin.firestore.FieldValue.serverTimestamp();
            if (task?.sent_at) {
                const sentAt = task.sent_at.toDate ? task.sent_at.toDate() : new Date(task.sent_at);
                updateData.response_time = Math.floor((Date.now() - sentAt.getTime()) / 1000);
            }
        } else if (action.type === 'STARTED' || action.type === 'ON_WAY') {
            updateData.started_at = admin.firestore.FieldValue.serverTimestamp();
        } else if (action.type === 'DONE') {
            updateData.completed_at = admin.firestore.FieldValue.serverTimestamp();
            if (task?.started_at) {
                const startedAt = task.started_at.toDate ? task.started_at.toDate() : new Date(task.started_at);
                updateData.completion_time = Math.floor((Date.now() - startedAt.getTime()) / 1000);
            }
        } else if (action.type === 'DECLINE') {
            updateData.status = 'REJECTED';
        }

        await taskDoc.ref.update(updateData);

        // Create notification for manager
        if (task?.creator_id) {
            await createTaskNotification(task, employee, action.type, task.creator_id);
        }

        functions.logger.info('[WhatsApp] Task updated', { taskId, updateData });
    } catch (error) {
        functions.logger.error('[WhatsApp] Error updating task', { error, taskId });
    }
}

// ─── Store Incoming Message ──────────────────────────────────────────

async function storeIncomingMessage(
    message: any,
    employeeId: string,
    employee: any,
    parsedAction: any
) {
    const messageData = {
        sender_id: employeeId,
        sender_name: employee.name,
        message_type: message.type.toUpperCase(),
        content: message.text?.body || message.button?.text || '',
        whatsapp_message_id: message.id,
        direction: 'INBOUND',
        status: 'DELIVERED',
        is_system_message: false,
        sent_at: new Date(parseInt(message.timestamp) * 1000),
        metadata: {
            parsed_action: parsedAction,
        },
    };

    // Try to find related task
    if (message.context?.id) {
        const relatedMessages = await db
            .collection('task_messages')
            .where('whatsapp_message_id', '==', message.context.id)
            .limit(1)
            .get();

        if (!relatedMessages.empty) {
            const relatedTaskId = relatedMessages.docs[0].data().task_id;
            (messageData as any).task_id = relatedTaskId;
        }
    }

    await db.collection('task_messages').add({
        ...messageData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ─── Create Task Notification ────────────────────────────────────────

async function createTaskNotification(
    task: any,
    employee: any,
    actionType: string,
    creatorId: string
) {
    const notificationTypes: Record<string, { type: string; title: string; message: string }> = {
        ACCEPT: {
            type: 'TASK_ACCEPTED',
            title: 'Task Accepted',
            message: `${employee.name} has accepted the task "${task.title}"`,
        },
        DECLINE: {
            type: 'TASK_ACCEPTED',
            title: 'Task Declined',
            message: `${employee.name} has declined the task "${task.title}"`,
        },
        DONE: {
            type: 'TASK_COMPLETED',
            title: 'Task Completed',
            message: `${employee.name} has completed the task "${task.title}"`,
        },
        ISSUE: {
            type: 'SYSTEM',
            title: 'Task Issue Reported',
            message: `${employee.name} reported an issue with "${task.title}"`,
        },
    };

    const notification = notificationTypes[actionType];
    if (!notification) return;

    await db.collection('notifications').add({
        recipient_id: creatorId,
        type: notification.type,
        priority: actionType === 'ISSUE' || actionType === 'DECLINE' ? 'HIGH' : 'NORMAL',
        title: notification.title,
        message: notification.message,
        task_id: task.id,
        status: 'PENDING',
        channels: ['dashboard'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ─── Mark Message as Read ────────────────────────────────────────────

async function markMessageAsRead(messageId: string, config: any) {
    if (!config) return;

    try {
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
        await axios.post(
            url,
            {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            },
            {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        functions.logger.error('[WhatsApp] Error marking message as read', { error, messageId });
    }
}
