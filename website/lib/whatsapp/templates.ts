import { Priority, TaskType } from '@/lib/validation/schemas';

// ─── Task Assignment Templates ─────────────────────────────────────

interface TaskTemplateData {
    taskTitle: string;
    description?: string;
    taskType: TaskType;
    priority: Priority;
    deadline?: string;
    location?: {
        address?: string;
    };
    deliverables?: Record<string, number>;
    budget?: number;
    taskId: string;
    employeeName?: string;
}

const PRIORITY_EMOJI: Record<Priority, string> = {
    URGENT: '🚨',
    HIGH: '⚡',
    NORMAL: '📋',
    LOW: '📝',
};

const PRIORITY_LABEL: Record<Priority, string> = {
    URGENT: 'URGENT ASSIGNMENT',
    HIGH: 'HIGH PRIORITY',
    NORMAL: 'NEW ASSIGNMENT',
    LOW: 'TASK ASSIGNED',
};

const TASK_TYPE_LABEL: Record<TaskType, string> = {
    BREAKING_NEWS: 'Breaking News Coverage',
    PRESS_CONF: 'Press Conference',
    INTERVIEW: 'Interview',
    PHOTO_ASSIGN: 'Photo Assignment',
    VIDEO_ASSIGN: 'Video Assignment',
    FACT_CHECK: 'Fact-Checking Mission',
    FOLLOW_UP: 'Follow-up Story',
    CUSTOM: 'Custom Task',
};

export function generateTaskAssignmentMessage(task: TaskTemplateData): string {
    const emoji = PRIORITY_EMOJI[task.priority];
    const priorityLabel = PRIORITY_LABEL[task.priority];
    const typeLabel = TASK_TYPE_LABEL[task.taskType];

    let message = `${emoji} *${priorityLabel}*\n\n`;
    message += `📰 *${typeLabel}*\n`;
    message += `${task.taskTitle}\n`;

    if (task.employeeName) {
        message = `Hi ${task.employeeName},\n\n` + message;
    }

    if (task.location?.address) {
        message += `\n📍 *Location:* ${task.location.address}`;
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const now = new Date();
        const timeDiff = deadlineDate.getTime() - now.getTime();
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        let timeDisplay: string;
        if (hoursLeft > 24) {
            timeDisplay = deadlineDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (hoursLeft > 0) {
            timeDisplay = `${hoursLeft}h ${minutesLeft}m from now`;
        } else {
            timeDisplay = `${minutesLeft} minutes from now`;
        }

        message += `\n⏰ *Deadline:* ${timeDisplay}`;
    }

    if (task.description) {
        const truncatedDesc = task.description.length > 200
            ? task.description.substring(0, 200) + '...'
            : task.description;
        message += `\n\n📝 *Details:*\n${truncatedDesc}`;
    }

    if (task.deliverables && Object.keys(task.deliverables).length > 0) {
        message += `\n\n✅ *Required Deliverables:*`;
        for (const [key, value] of Object.entries(task.deliverables)) {
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            message += `\n• ${formattedKey}: ${value}`;
        }
    }

    if (task.budget) {
        message += `\n\n💰 *Budget:* BD ${task.budget.toFixed(2)}`;
    }

    message += `\n\n---\n*Task ID:* #${task.taskId.substring(0, 8).toUpperCase()}`;

    return message;
}

// ─── Breaking News Template ────────────────────────────────────────

export function generateBreakingNewsMessage(task: TaskTemplateData): string {
    let message = `🚨 *URGENT: BREAKING NEWS*\n\n`;
    message += `📰 *Story:* ${task.taskTitle}\n`;

    if (task.location?.address) {
        message += `📍 *Location:* ${task.location.address}\n`;
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const now = new Date();
        const minutesLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60));
        message += `⏰ *Deadline:* ${minutesLeft} minutes\n`;
    }

    if (task.deliverables) {
        message += `\n*Required:*\n`;
        if (task.deliverables.photos) message += `• On-scene photos (min ${task.deliverables.photos})\n`;
        if (task.deliverables.quotes) message += `• Interviews (${task.deliverables.quotes} quotes)\n`;
        if (task.deliverables.article) message += `• Full article\n`;
    }

    message += `\n*Task ID:* #${task.taskId.substring(0, 8).toUpperCase()}`;

    return message;
}

// ─── Press Conference Template ─────────────────────────────────────

export function generatePressConferenceMessage(task: TaskTemplateData): string {
    let message = `📢 *PRESS CONFERENCE*\n\n`;
    message += `🏛️ *Event:* ${task.taskTitle}\n`;

    if (task.location?.address) {
        message += `📍 *Venue:* ${task.location.address}\n`;
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        message += `📅 *Date:* ${deadlineDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        })}\n`;
        message += `🕐 *Time:* ${deadlineDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })}\n`;
    }

    if (task.description) {
        message += `\n🎤 *Details:* ${task.description}\n`;
    }

    if (task.deliverables) {
        message += `\n*Coverage Requirements:*\n`;
        message += `• Full speech notes\n`;
        message += `• Key statistics\n`;
        message += `• Speaker quotes\n`;
        message += `• Q&A highlights\n`;
    }

    if (task.budget) {
        message += `\n💰 *Budget:* BD ${task.budget.toFixed(2)}\n`;
    }

    message += `\n*Task ID:* #${task.taskId.substring(0, 8).toUpperCase()}`;

    return message;
}

// ─── Interview Template ────────────────────────────────────────────

export function generateInterviewMessage(task: TaskTemplateData): string {
    let message = `🎙️ *INTERVIEW ASSIGNMENT*\n\n`;
    message += `👤 *Subject:* ${task.taskTitle}\n`;

    if (task.location?.address) {
        message += `📍 *Location:* ${task.location.address}\n`;
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        message += `📅 *Scheduled:* ${deadlineDate.toLocaleString()}\n`;
    }

    if (task.description) {
        message += `\n📝 *Context:*\n${task.description}\n`;
    }

    message += `\n*Requirements:*\n`;
    message += `• Prepare questions in advance\n`;
    message += `• Record audio/video (with permission)\n`;
    message += `• Take notes and photos\n`;
    message += `• Submit transcript and quotes\n`;

    message += `\n*Task ID:* #${task.taskId.substring(0, 8).toUpperCase()}`;

    return message;
}

// ─── Photo Assignment Template ─────────────────────────────────────

export function generatePhotoAssignmentMessage(task: TaskTemplateData): string {
    let message = `📷 *PHOTO ASSIGNMENT*\n\n`;
    message += `📸 *Subject:* ${task.taskTitle}\n`;

    if (task.location?.address) {
        message += `📍 *Location:* ${task.location.address}\n`;
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        message += `⏰ *Deadline:* ${deadlineDate.toLocaleString()}\n`;
    }

    if (task.deliverables) {
        message += `\n*Required Shots:*\n`;
        if (task.deliverables.photos) {
            message += `• Minimum ${task.deliverables.photos} high-quality photos\n`;
        }
        message += `• Wide shots establishing the scene\n`;
        message += `• Close-up detail shots\n`;
        message += `• Action/candid shots if applicable\n`;
    }

    if (task.budget) {
        message += `\n💰 *Budget:* BD ${task.budget.toFixed(2)}\n`;
    }

    message += `\n*Task ID:* #${task.taskId.substring(0, 8).toUpperCase()}`;

    return message;
}

// ─── Reminder Templates ────────────────────────────────────────────

export function generateDeadlineReminderMessage(
    taskTitle: string,
    taskId: string,
    timeRemaining: string
): string {
    return `⏰ *DEADLINE REMINDER*\n\n` +
        `📰 *Task:* ${taskTitle}\n` +
        `⏰ *Time remaining:* ${timeRemaining}\n\n` +
        `Please update your progress or request an extension if needed.\n\n` +
        `*Task ID:* #${taskId.substring(0, 8).toUpperCase()}`;
}

export function generateOverdueAlertMessage(
    taskTitle: string,
    taskId: string,
    overdueBy: string
): string {
    return `⚠️ *OVERDUE ALERT*\n\n` +
        `📰 *Task:* ${taskTitle}\n` +
        `⏰ *Overdue by:* ${overdueBy}\n\n` +
        `This task is now overdue. Please provide an immediate update on your progress.\n\n` +
        `*Task ID:* #${taskId.substring(0, 8).toUpperCase()}`;
}

// ─── Status Update Templates ───────────────────────────────────────

export function generateTaskAcceptedMessage(
    managerName: string,
    taskTitle: string,
    employeeName: string
): string {
    return `✅ *Task Accepted*\n\n` +
        `Hi ${managerName},\n\n` +
        `${employeeName} has accepted the assignment:\n` +
        `📰 ${taskTitle}\n\n` +
        `They will begin working on it shortly.`;
}

export function generateTaskCompletedMessage(
    managerName: string,
    taskTitle: string,
    employeeName: string
): string {
    return `🎉 *Task Completed*\n\n` +
        `Hi ${managerName},\n\n` +
        `${employeeName} has completed the assignment:\n` +
        `📰 ${taskTitle}\n\n` +
        `Please review the submitted deliverables.`;
}

// ─── System Notification Templates ─────────────────────────────────

export function generateEscalationMessage(
    managerName: string,
    taskTitle: string,
    taskId: string,
    reason: string
): string {
    return `🚨 *ESCALATION ALERT*\n\n` +
        `Hi ${managerName},\n\n` +
        `The following task requires your attention:\n\n` +
        `📰 *Task:* ${taskTitle}\n` +
        `⚠️ *Reason:* ${reason}\n\n` +
        `Please review and take action.\n\n` +
        `*Task ID:* #${taskId.substring(0, 8).toUpperCase()}`;
}

// ─── Template Selector ─────────────────────────────────────────────

export function generateMessageByTaskType(task: TaskTemplateData): string {
    switch (task.taskType) {
        case 'BREAKING_NEWS':
            return generateBreakingNewsMessage(task);
        case 'PRESS_CONF':
            return generatePressConferenceMessage(task);
        case 'INTERVIEW':
            return generateInterviewMessage(task);
        case 'PHOTO_ASSIGN':
            return generatePhotoAssignmentMessage(task);
        case 'VIDEO_ASSIGN':
            return generatePhotoAssignmentMessage({ ...task, taskTitle: `Video: ${task.taskTitle}` });
        default:
            return generateTaskAssignmentMessage(task);
    }
}

// ─── Interactive Button Configs ────────────────────────────────────

export const TASK_BUTTONS = {
    accept_decline: (taskId: string) => [
        { id: `accept_${taskId}`, title: '✓ Accept' },
        { id: `decline_${taskId}`, title: '✗ Decline' },
    ],
    progress_update: (taskId: string) => [
        { id: `started_${taskId}`, title: '🚀 Started' },
        { id: `onway_${taskId}`, title: '📍 On my way' },
        { id: `delay_${taskId}`, title: '⏰ Running late' },
    ],
    completion: (taskId: string) => [
        { id: `done_${taskId}`, title: '✅ Done' },
        { id: `issue_${taskId}`, title: '⚠️ Issue' },
    ],
    escalate: (taskId: string) => [
        { id: `reassign_${taskId}`, title: '🔄 Reassign' },
        { id: `extend_${taskId}`, title: '⏰ Extend deadline' },
        { id: `cancel_${taskId}`, title: '❌ Cancel task' },
    ],
};
