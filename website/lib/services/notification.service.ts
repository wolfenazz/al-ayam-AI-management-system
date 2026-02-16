import { cache } from 'react'
import {
  createDocument,
  updateDocument,
  getDocument,
  getCollection
} from '../firebase/firestore'
import {
  where,
  orderBy,
  QueryConstraint
} from 'firebase/firestore'
import type {
  Notification,
  NotificationFilters,
  NotificationChannel
} from '../types/notification'
import type { Task } from '../types/task'

const COLLECTION = 'notifications'

export const getNotification = cache(
  async (notificationId: string): Promise<Notification | null> => {
    return getDocument<Notification>(COLLECTION, notificationId)
  }
)

export const getNotifications = cache(
  async (filters?: NotificationFilters): Promise<Notification[]> => {
    const constraints: QueryConstraint[] = []

    if (filters?.recipientId) {
      constraints.push(where('recipientId', '==', filters.recipientId))
    }

    if (filters?.type) {
      constraints.push(where('type', '==', filters.type))
    }

    if (filters?.priority) {
      constraints.push(where('priority', '==', filters.priority))
    }

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }

    if (filters?.isUnreadOnly) {
      constraints.push(where('status', 'in', ['PENDING', 'DELIVERED', 'SENT']))
    }

    constraints.push(orderBy('createdAt', 'desc'))

    return getCollection<Notification>(COLLECTION, constraints)
  }
)

export const getUnreadCount = cache(
  async (recipientId: string): Promise<number> => {
    const notifications = await getNotifications({
      recipientId,
      isUnreadOnly: true
    })
    return notifications.length
  }
)

export async function createNotification(data: {
  readonly recipientId: string
  readonly type: Notification['type']
  readonly priority: Notification['priority']
  readonly title: string
  readonly message: string
  readonly actionUrl?: string
  readonly taskId?: string
  readonly channels?: readonly NotificationChannel[]
}): Promise<string> {
  const notification = {
    ...data,
    status: 'PENDING' as const,
    channels: data.channels || (['dashboard'] as const),
    actionUrl: data.actionUrl || null,
    taskId: data.taskId || null,
    createdAt: new Date(),
    sentAt: null,
    readAt: null,
    expiresAt: null
  }

  return createDocument(COLLECTION, notification)
}

export async function markAsRead(
  notificationId: string
): Promise<void> {
  await updateDocument(COLLECTION, notificationId, {
    status: 'READ' as const,
    readAt: new Date()
  })
}

export async function markAllAsRead(recipientId: string): Promise<void> {
  const notifications = await getNotifications({
    recipientId,
    isUnreadOnly: true
  })

  await Promise.all(
    notifications.map((notification) => markAsRead(notification.id))
  )
}

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await updateDocument(COLLECTION, notificationId, {
    status: 'FAILED' as const
  })
}

export async function notifyTaskAssigned(
  recipientId: string,
  task: Task
): Promise<void> {
  await createNotification({
    recipientId,
    type: 'TASK_ASSIGNED',
    priority: task.priority === 'URGENT' ? 'CRITICAL' : 'HIGH',
    title: 'New Task Assigned',
    message: `You have been assigned a new task: ${task.title}`,
    actionUrl: `/dashboard/tasks/${task.id}`,
    taskId: task.id,
    channels: ['dashboard', 'whatsapp'] as const
  })
}

export async function notifyTaskAccepted(
  recipientId: string,
  taskId: string,
  employeeName: string
): Promise<void> {
  await createNotification({
    recipientId,
    type: 'TASK_ACCEPTED',
    priority: 'HIGH',
    title: 'Task Accepted',
    message: `${employeeName} has accepted the task`,
    actionUrl: `/dashboard/tasks/${taskId}`,
    taskId,
    channels: ['dashboard', 'push'] as const
  })
}

export async function notifyTaskCompleted(
  recipientId: string,
  taskId: string,
  employeeName: string
): Promise<void> {
  await createNotification({
    recipientId,
    type: 'TASK_COMPLETED',
    priority: 'HIGH',
    title: 'Task Completed',
    message: `${employeeName} has completed the task. Review required.`,
    actionUrl: `/dashboard/tasks/${taskId}`,
    taskId,
    channels: ['dashboard', 'email', 'push'] as const
  })
}

export async function notifyDeadlineApproaching(
  recipientId: string,
  taskId: string,
  taskTitle: string,
  timeRemaining: string
): Promise<void> {
  await createNotification({
    recipientId,
    type: 'DEADLINE_APPROACHING',
    priority: 'NORMAL',
    title: 'Deadline Approaching',
    message: `Task "${taskTitle}" is due in ${timeRemaining}`,
    actionUrl: `/dashboard/tasks/${taskId}`,
    taskId,
    channels: ['dashboard', 'whatsapp'] as const
  })
}

export async function notifyTaskOverdue(
  recipientId: string,
  taskId: string,
  taskTitle: string,
  employeeId?: string
): Promise<void> {
  const priority = employeeId ? 'HIGH' : 'CRITICAL'

  await createNotification({
    recipientId,
    type: 'OVERDUE',
    priority,
    title: 'Task Overdue',
    message: `Task "${taskTitle}" has exceeded its deadline`,
    actionUrl: `/dashboard/tasks/${taskId}`,
    taskId,
    channels: priority === 'CRITICAL'
      ? (['dashboard', 'email', 'sms', 'push'] as const)
      : (['dashboard', 'whatsapp'] as const)
  })
}

export async function notifyEscalation(
  recipientId: string,
  taskId: string,
  taskTitle: string,
  escalationLevel: number
): Promise<void> {
  await createNotification({
    recipientId,
    type: 'ESCALATION',
    priority: 'CRITICAL',
    title: 'Task Escalated',
    message: `Task "${taskTitle}" has been escalated (Level ${escalationLevel})`,
    actionUrl: `/dashboard/tasks/${taskId}`,
    taskId,
    channels: ['dashboard', 'email', 'sms', 'push'] as const
  })
}

export async function notifyMediaUploaded(
  recipientId: string,
  taskId: string,
  fileName: string
): Promise<void> {
  await createNotification({
    recipientId,
    type: 'MEDIA_UPLOADED',
    priority: 'NORMAL',
    title: 'New Media Uploaded',
    message: `${fileName} has been uploaded to the task`,
    actionUrl: `/dashboard/tasks/${taskId}`,
    taskId,
    channels: ['dashboard'] as const
  })
}

export async function cleanupOldNotifications(
  recipientId: string,
  olderThanDays = 30
): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const notifications = await getNotifications({
    recipientId
  })

  const oldNotifications = notifications.filter(
    (notification) => new Date(notification.createdAt) < cutoffDate
  )

  await Promise.all(
    oldNotifications.map((notification) =>
      deleteNotification(notification.id)
    )
  )
}
