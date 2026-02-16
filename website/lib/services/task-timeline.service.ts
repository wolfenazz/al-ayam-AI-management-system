import { cache } from 'react'
import {
  createDocument,
  getCollection
} from '../firebase/firestore'
import { query, where, orderBy } from 'firebase/firestore'
import type { Task } from '../types/task'

const SUBCOLLECTION = 'timeline'

export type TimelineEventType =
  | 'CREATED'
  | 'ASSIGNED'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REVIEW'
  | 'PUBLISHED'
  | 'ESCALATED'
  | 'REMINDER_SENT'
  | 'MESSAGE_SENT'
  | 'MESSAGE_RECEIVED'
  | 'MEDIA_UPLOADED'

export interface TimelineEvent {
  readonly id: string
  readonly taskId: string
  readonly eventType: TimelineEventType
  readonly userId: string
  readonly userName: string
  readonly description: string
  readonly metadata: Record<string, unknown> | null
  readonly createdAt: Date
}

export const getTimelineForTask = cache(
  async (taskId: string): Promise<TimelineEvent[]> => {
    const events = await getCollection<TimelineEvent>(
      `tasks/${taskId}/${SUBCOLLECTION}`,
      [
        orderBy('createdAt', 'desc')
      ]
    )
    
    return events.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
)

export async function createTimelineEvent(
  taskId: string,
  eventType: TimelineEventType,
  userId: string,
  userName: string,
  description: string,
  metadata: Record<string, unknown> | null = null
): Promise<string> {
  const event: Omit<TimelineEvent, 'id'> = {
    taskId,
    eventType,
    userId,
    userName,
    description,
    metadata,
    createdAt: new Date()
  }

  return createDocument(`tasks/${taskId}/${SUBCOLLECTION}`, event)
}

export async function logTaskCreated(
  taskId: string,
  userId: string,
  userName: string,
  taskTitle: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'CREATED',
    userId,
    userName,
    `Created task "${taskTitle}"`,
    { taskTitle }
  )
}

export async function logTaskAssigned(
  taskId: string,
  userId: string,
  userName: string,
  assigneeName: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'ASSIGNED',
    userId,
    userName,
    `Assigned task to ${assigneeName}`,
    { assigneeName }
  )
}

export async function logTaskSent(
  taskId: string,
  userId: string,
  userName: string,
  channel: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'SENT',
    userId,
    userName,
    `Task sent via ${channel}`,
    { channel }
  )
}

export async function logTaskAccepted(
  taskId: string,
  userId: string,
  userName: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'ACCEPTED',
    userId,
    userName,
    'Accepted task',
    null
  )
}

export async function logTaskDeclined(
  taskId: string,
  userId: string,
  userName: string,
  reason?: string
): Promise<void> {
  const description = reason
    ? `Declined task: ${reason}`
    : 'Declined task'
    
  await createTimelineEvent(
    taskId,
    'DECLINED',
    userId,
    userName,
    description,
    { reason }
  )
}

export async function logTaskStarted(
  taskId: string,
  userId: string,
  userName: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'IN_PROGRESS',
    userId,
    userName,
    'Started working on task',
    null
  )
}

export async function logTaskCompleted(
  taskId: string,
  userId: string,
  userName: string,
  qualityRating?: number
): Promise<void> {
  const description = qualityRating
    ? `Completed task with quality rating: ${qualityRating}/5`
    : 'Completed task'
    
  await createTimelineEvent(
    taskId,
    'COMPLETED',
    userId,
    userName,
    description,
    { qualityRating }
  )
}

export async function logTaskEscalated(
  taskId: string,
  userId: string,
  userName: string,
  escalationLevel: number,
  reason?: string
): Promise<void> {
  const description = reason
    ? `Task escalated to level ${escalationLevel}: ${reason}`
    : `Task escalated to level ${escalationLevel}`
    
  await createTimelineEvent(
    taskId,
    'ESCALATED',
    userId,
    userName,
    description,
    { escalationLevel, reason }
  )
}

export async function logMessageSent(
  taskId: string,
  userId: string,
  userName: string,
  recipientName: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'MESSAGE_SENT',
    userId,
    userName,
    `Sent message to ${recipientName}`,
    { recipientName }
  )
}

export async function logMessageReceived(
  taskId: string,
  userId: string,
  userName: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'MESSAGE_RECEIVED',
    userId,
    userName,
    'Received message',
    null
  )
}

export async function logMediaUploaded(
  taskId: string,
  userId: string,
  userName: string,
  fileName: string,
  fileType: string
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'MEDIA_UPLOADED',
    userId,
    userName,
    `Uploaded ${fileType}: ${fileName}`,
    { fileName, fileType }
  )
}

export async function logReminderSent(
  taskId: string,
  userId: string,
  userName: string,
  reminderType: 'GENTLE' | 'URGENT' | 'ESCALATION'
): Promise<void> {
  await createTimelineEvent(
    taskId,
    'REMINDER_SENT',
    userId,
    userName,
    `Sent ${reminderType.toLowerCase()} reminder`,
    { reminderType }
  )
}

export function getEventIcon(eventType: TimelineEventType): string {
  const icons: Record<TimelineEventType, string> = {
    CREATED: '📝',
    ASSIGNED: '👤',
    SENT: '📤',
    ACCEPTED: '✅',
    DECLINED: '❌',
    IN_PROGRESS: '⚡',
    COMPLETED: '🎉',
    REJECTED: '🚫',
    CANCELLED: '⛔',
    REVIEW: '👀',
    PUBLISHED: '📰',
    ESCALATED: '🚨',
    REMINDER_SENT: '⏰',
    MESSAGE_SENT: '💬',
    MESSAGE_RECEIVED: '📥',
    MEDIA_UPLOADED: '📎'
  }
  
  return icons[eventType] || '📋'
}

export function getEventColor(eventType: TimelineEventType): string {
  const colors: Record<TimelineEventType, string> = {
    CREATED: 'blue',
    ASSIGNED: 'purple',
    SENT: 'cyan',
    ACCEPTED: 'green',
    DECLINED: 'red',
    IN_PROGRESS: 'orange',
    COMPLETED: 'green',
    REJECTED: 'red',
    CANCELLED: 'gray',
    REVIEW: 'yellow',
    PUBLISHED: 'blue',
    ESCALATED: 'red',
    REMINDER_SENT: 'orange',
    MESSAGE_SENT: 'blue',
    MESSAGE_RECEIVED: 'green',
    MEDIA_UPLOADED: 'purple'
  }
  
  return colors[eventType] || 'gray'
}

export function getEventTitle(eventType: TimelineEventType): string {
  const titles: Record<TimelineEventType, string> = {
    CREATED: 'Task Created',
    ASSIGNED: 'Task Assigned',
    SENT: 'Task Sent',
    ACCEPTED: 'Task Accepted',
    DECLINED: 'Task Declined',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Task Completed',
    REJECTED: 'Task Rejected',
    CANCELLED: 'Task Cancelled',
    REVIEW: 'Under Review',
    PUBLISHED: 'Published',
    ESCALATED: 'Task Escalated',
    REMINDER_SENT: 'Reminder Sent',
    MESSAGE_SENT: 'Message Sent',
    MESSAGE_RECEIVED: 'Message Received',
    MEDIA_UPLOADED: 'Media Uploaded'
  }
  
  return titles[eventType] || 'Event'
}
