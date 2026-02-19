import { NextRequest, NextResponse } from 'next/server';
import {
    queryDocuments,
    getDocument,
    updateDocument,
    setDocument,
    COLLECTIONS,
    where,
    serverTimestamp,
} from '@/lib/firebase/firestore';
import { parseWhatsAppMessage, getTaskStatusFromAction } from '@/lib/whatsapp/parser';
import { markMessageAsRead, getWhatsAppConfig } from '@/lib/whatsapp/api';
import type { WhatsAppWebhookPayload } from '@/lib/validation/schemas';

// ─── Webhook Verification (GET) ────────────────────────────────────

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const config = getWhatsAppConfig();

    if (mode === 'subscribe' && token === config?.webhookVerifyToken) {
        console.log('[WhatsApp] Webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
    }

    console.log('[WhatsApp] Webhook verification failed');
    return NextResponse.json(
        { error: 'Verification failed' },
        { status: 403 }
    );
}

// ─── Webhook Handler (POST) ────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const payload = body as WhatsAppWebhookPayload;

        console.log('[WhatsApp] Webhook received:', JSON.stringify(payload, null, 2));

        if (!payload.entry || payload.entry.length === 0) {
            return NextResponse.json({ status: 'no entries' }, { status: 200 });
        }

        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.field === 'messages') {
                    await handleMessagesChange(change.value);
                }
            }
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        console.error('[WhatsApp] Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ─── Message Handler ───────────────────────────────────────────────

async function handleMessagesChange(value: any) {
    const { messages, statuses, contacts, metadata } = value;

    if (statuses && statuses.length > 0) {
        await handleStatusUpdates(statuses);
    }

    if (messages && messages.length > 0) {
        for (const message of messages) {
            await handleIncomingMessage(message, contacts, metadata);
        }
    }
}

// ─── Status Update Handler ─────────────────────────────────────────

async function handleStatusUpdates(statuses: any[]) {
    for (const status of statuses) {
        const { id: messageId, status: messageStatus, timestamp } = status;

        try {
            const messages = await queryDocuments<any>(
                COLLECTIONS.TASK_MESSAGES,
                [where('whatsapp_message_id', '==', messageId)]
            );

            if (messages.length > 0) {
                const msg = messages[0];
                const updateData: Record<string, any> = {
                    status: messageStatus.toUpperCase(),
                };

                if (messageStatus === 'delivered') {
                    updateData.delivered_at = new Date(parseInt(timestamp) * 1000).toISOString();
                } else if (messageStatus === 'read') {
                    updateData.read_at = new Date(parseInt(timestamp) * 1000).toISOString();
                }

                await updateDocument(COLLECTIONS.TASK_MESSAGES, msg.id, updateData);

                if (msg.task_id && messageStatus === 'read') {
                    await updateDocument(COLLECTIONS.TASKS, msg.task_id, {
                        read_at: new Date().toISOString(),
                    });
                }
            }
        } catch (error) {
            console.error('[WhatsApp] Error updating message status:', error);
        }
    }
}

// ─── Incoming Message Handler ──────────────────────────────────────

async function handleIncomingMessage(message: any, contacts: any[], metadata: any) {
    const parsedMessage = parseWhatsAppMessage(message);
    console.log('[WhatsApp] Parsed message:', parsedMessage);

    const senderPhone = parsedMessage.senderPhone;
    const contact = contacts?.find(c => c.wa_id === senderPhone);
    const senderName = contact?.profile?.name || 'Unknown';

    try {
        const employees = await queryDocuments<any>(
            COLLECTIONS.EMPLOYEES,
            [where('phone_number', '==', senderPhone)]
        );

        if (employees.length === 0) {
            console.log('[WhatsApp] Unknown sender:', senderPhone);
            return;
        }

        const employee = employees[0];

        if (parsedMessage.parsedAction && parsedMessage.parsedAction.type !== 'UNKNOWN') {
            await handleTaskAction(parsedMessage.parsedAction, employee, parsedMessage);
        }

        await createTaskMessage(message, employee, parsedMessage);

        const config = getWhatsAppConfig();
        if (config) {
            await markMessageAsRead(parsedMessage.messageId);
        }

    } catch (error) {
        console.error('[WhatsApp] Error handling message:', error);
    }
}

// ─── Task Action Handler ───────────────────────────────────────────

async function handleTaskAction(action: any, employee: any, parsedMessage: any) {
    const taskId = action.taskId;

    if (taskId === 'unknown') {
        console.log('[WhatsApp] Cannot process action without task ID');
        return;
    }

    try {
        const task = await getDocument<any>(COLLECTIONS.TASKS, taskId);

        if (!task) {
            console.log('[WhatsApp] Task not found:', taskId);
            return;
        }

        if (task.assignee_id !== employee.id) {
            console.log('[WhatsApp] Task not assigned to this employee');
            return;
        }

        const newStatus = getTaskStatusFromAction(action);
        if (!newStatus) {
            console.log('[WhatsApp] No status change for action:', action.type);
            return;
        }

        const updateData: Record<string, any> = {
            status: newStatus,
        };

        switch (action.type) {
            case 'ACCEPT':
                updateData.accepted_at = new Date().toISOString();
                if (task.sent_at) {
                    updateData.response_time = Math.floor(
                        (Date.now() - new Date(task.sent_at).getTime()) / 1000
                    );
                }
                break;

            case 'DECLINE':
                updateData.status = 'REJECTED';
                break;

            case 'STARTED':
            case 'ON_WAY':
                updateData.started_at = new Date().toISOString();
                break;

            case 'DONE':
                updateData.completed_at = new Date().toISOString();
                if (task.started_at) {
                    updateData.completion_time = Math.floor(
                        (Date.now() - new Date(task.started_at).getTime()) / 1000
                    );
                }
                break;

            case 'DELAY':
                if (action.minutes) {
                    const currentDeadline = task.deadline
                        ? new Date(task.deadline)
                        : new Date();
                    updateData.deadline = new Date(
                        currentDeadline.getTime() + action.minutes * 60 * 1000
                    ).toISOString();
                }
                updateData.escalation_count = (task.escalation_count || 0) + 1;
                break;

            case 'ISSUE':
                updateData.status = 'REVIEW';
                break;
        }

        await updateDocument(COLLECTIONS.TASKS, taskId, updateData);

        await createSystemNotification(task, employee, action.type);

        console.log('[WhatsApp] Task updated:', taskId, updateData);

    } catch (error) {
        console.error('[WhatsApp] Error updating task:', error);
    }
}

// ─── Create Task Message ───────────────────────────────────────────

async function createTaskMessage(message: any, employee: any, parsedMessage: any) {
    const replyToId = parsedMessage.replyToMessageId;

    let taskId = 'unknown';

    if (replyToId) {
        const relatedMessages = await queryDocuments<any>(
            COLLECTIONS.TASK_MESSAGES,
            [where('whatsapp_message_id', '==', replyToId)]
        );

        if (relatedMessages.length > 0) {
            taskId = relatedMessages[0].task_id;
        }
    }

    if (taskId === 'unknown' && parsedMessage.parsedAction?.taskId) {
        taskId = parsedMessage.parsedAction.taskId;
    }

    const messageData = {
        task_id: taskId,
        sender_id: employee.id,
        sender_name: employee.name,
        message_type: parsedMessage.messageType.toUpperCase(),
        content: message.text?.body || message.button?.text || '',
        whatsapp_message_id: parsedMessage.messageId,
        direction: 'INBOUND',
        status: 'DELIVERED',
        is_system_message: false,
        sent_at: parsedMessage.timestamp.toISOString(),
        metadata: {
            parsed_action: parsedMessage.parsedAction,
            extracted_data: parsedMessage.extractedData,
        },
    };

    await setDocument(COLLECTIONS.TASK_MESSAGES, parsedMessage.messageId, {
        ...messageData,
        created_at: serverTimestamp(),
    });
}

// ─── Create System Notification ────────────────────────────────────

async function createSystemNotification(task: any, employee: any, actionType: string) {
    if (!task.creator_id) return;

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
        DELAY: {
            type: 'SYSTEM',
            title: 'Task Delay Reported',
            message: `${employee.name} reported a delay for "${task.title}"`,
        },
    };

    const notification = notificationTypes[actionType];
    if (!notification) return;

    await setDocument(COLLECTIONS.NOTIFICATIONS, `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`, {
        recipient_id: task.creator_id,
        type: notification.type,
        priority: actionType === 'ISSUE' || actionType === 'DECLINE' ? 'HIGH' : 'NORMAL',
        title: notification.title,
        message: notification.message,
        task_id: task.id,
        status: 'PENDING',
        channels: ['dashboard'],
        created_at: serverTimestamp(),
    });
}
