import { cache } from 'react'
import { getDocument, createDocument, updateDocument, deleteDocument } from '../firebase/firestore'
import { getCollection, buildQuery } from '../firebase/firestore'
import { query, where, orderBy, and, or, QueryConstraint } from 'firebase/firestore'
import { sendWhatsAppMessage } from './whatsapp.service'
import { generateTaskMessage } from './whatsapp-templates.service'
import { logTaskCreated, logTaskAssigned, logTaskSent, logTaskAccepted, logTaskDeclined, logTaskStarted, logTaskCompleted } from './task-timeline.service'
import type { Task, TaskFormData, TaskFilters } from '../types/task'
import type { Employee } from '../types/employee'

const COLLECTION = 'tasks'

export const getTask = cache(
  async (taskId: string): Promise<Task | null> => {
    return getDocument<Task>(COLLECTION, taskId)
  }
)

export const getTasks = cache(
  async (filters?: TaskFilters): Promise<Task[]> => {
    const constraints: QueryConstraint[] = []

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }

    if (filters?.priority) {
      constraints.push(where('priority', '==', filters.priority))
    }

    if (filters?.type) {
      constraints.push(where('type', '==', filters.type))
    }

    if (filters?.assigneeId) {
      constraints.push(where('assigneeId', '==', filters.assigneeId))
    }

    constraints.push(orderBy('createdAt', 'desc'))

    if (filters?.dateFrom || filters?.dateTo) {
      if (filters.dateFrom) {
        constraints.push(
          where('createdAt', '>=', filters.dateFrom.toISOString())
        )
      }
      if (filters.dateTo) {
        constraints.push(
          where('createdAt', '<=', filters.dateTo.toISOString())
        )
      }
    }

    return getCollection<Task>(COLLECTION, constraints)
  }
)

export const getTasksForEmployee = cache(
  async (employeeId: string): Promise<Task[]> => {
    return getCollection<Task>(COLLECTION, [
      where('assigneeId', '==', employeeId),
      orderBy('createdAt', 'desc')
    ])
  }
)

export const getRecentTasks = cache(
  async (limitCount = 10): Promise<Task[]> => {
    return getCollection<Task>(COLLECTION, [
      orderBy('createdAt', 'desc')
    ]).then((tasks) => tasks.slice(0, limitCount))
  }
)

export async function createTask(data: TaskFormData, creatorId: string, creatorName: string = 'Unknown'): Promise<string> {
  const task = {
    ...data,
    status: 'DRAFT' as const,
    creatorId,
    createdAt: new Date().toISOString(),
    sentAt: null,
    readAt: null,
    acceptedAt: null,
    startedAt: null,
    completedAt: null,
    reviewedAt: null,
    responseTime: null,
    completionTime: null,
    qualityRating: null,
    escalationCount: 0,
    lastReminderSent: null
  }

  const taskId = await createDocument(COLLECTION, task)

  await logTaskCreated(taskId, creatorId || 'system', creatorName, data.title)

  return taskId
}

export async function updateTask(
  taskId: string,
  data: Partial<Task>
): Promise<void> {
  await updateDocument(COLLECTION, taskId, data)
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDocument(COLLECTION, taskId)
}

export async function updateTaskStatus(
  taskId: string,
  status: Task['status'],
  userName: string = 'Unknown',
  metadata?: Partial<Omit<Task, 'id' | 'status'>>
): Promise<void> {
  const updateData: Partial<Task> = {
    status,
    ...metadata
  }

  if (status === 'SENT' && !metadata?.sentAt) {
    (updateData as Partial<Task> & { sentAt: Date }).sentAt = new Date()
  } else if (status === 'READ' && !metadata?.readAt) {
    (updateData as Partial<Task> & { readAt: Date }).readAt = new Date()
  } else if (status === 'ACCEPTED' && !metadata?.acceptedAt) {
    (updateData as Partial<Task> & { acceptedAt: Date }).acceptedAt = new Date()
  } else if (status === 'IN_PROGRESS' && !metadata?.startedAt) {
    (updateData as Partial<Task> & { startedAt: Date }).startedAt = new Date()
  } else if (status === 'COMPLETED' && !metadata?.completedAt) {
    (updateData as Partial<Task> & { completedAt: Date }).completedAt = new Date()
  }

  await updateTask(taskId, updateData)

  const task = await getTask(taskId)
  if (task) {
    if (status === 'SENT' && !metadata?.sentAt) {
      await logTaskSent(taskId, task.creatorId, userName, 'WhatsApp')
    } else if (status === 'ACCEPTED' && !metadata?.acceptedAt) {
      await logTaskAccepted(taskId, task.assigneeId || userName, userName)
    } else if (status === 'REJECTED') {
      await logTaskDeclined(taskId, task.assigneeId || userName, userName)
    } else if (status === 'IN_PROGRESS' && !metadata?.startedAt) {
      await logTaskStarted(taskId, task.assigneeId || userName, userName)
    } else if (status === 'COMPLETED' && !metadata?.completedAt) {
      const rating = metadata?.qualityRating ?? undefined
      await logTaskCompleted(taskId, task.assigneeId || userName, userName, rating)
    }
  }
}

export async function assignTask(taskId: string, employeeId: string, employeeName: string = 'Unknown', assignerName: string = 'Unknown'): Promise<void> {
  await updateTask(taskId, { assigneeId: employeeId })

  await logTaskAssigned(taskId, assignerName, assignerName, employeeName)
}

export async function escalateTask(taskId: string): Promise<void> {
  const task = await getTask(taskId)
  if (!task) return

  await updateTask(taskId, {
    escalationCount: task.escalationCount + 1
  } as Partial<Task>)
}

export async function dispatchTaskToEmployee(
  taskId: string,
  employee: Employee
): Promise<void> {
  const task = await getTask(taskId)
  if (!task) {
    throw new Error('Task not found')
  }

  if (!employee.whatsappUid) {
    throw new Error('Employee does not have a WhatsApp phone number')
  }

  const { message } = generateTaskMessage({
    task,
    employee,
    includeQuickReplies: true
  })

  await sendWhatsAppMessage({
    taskId,
    recipientId: employee.id,
    recipientPhone: employee.whatsappUid,
    message
  })

  await updateTaskStatus(taskId, 'SENT')
}
