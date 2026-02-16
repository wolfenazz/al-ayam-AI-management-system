import { cache } from 'react'
import { getDocument, createDocument, updateDocument, deleteDocument } from '../firebase/firestore'
import { getCollection, buildQuery } from '../firebase/firestore'
import { query, where, orderBy, and, or, QueryConstraint } from 'firebase/firestore'
import type { Task, TaskFormData, TaskFilters } from '../types/task'

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

export async function createTask(data: TaskFormData): Promise<string> {
  const task = {
    ...data,
    status: 'DRAFT' as const,
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

  return createDocument(COLLECTION, task)
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
  metadata?: Partial<Omit<Task, 'id' | 'status'>>
): Promise<void> {
  const updateData: Partial<Task> = {
    status,
    ...metadata
  }

  if (status === 'SENT' && !metadata?.sentAt) {
    (updateData as any).sentAt = new Date()
  } else if (status === 'READ' && !metadata?.readAt) {
    (updateData as any).readAt = new Date()
  } else if (status === 'ACCEPTED' && !metadata?.acceptedAt) {
    (updateData as any).acceptedAt = new Date()
  } else if (status === 'IN_PROGRESS' && !metadata?.startedAt) {
    (updateData as any).startedAt = new Date()
  } else if (status === 'COMPLETED' && !metadata?.completedAt) {
    (updateData as any).completedAt = new Date()
  }

  await updateTask(taskId, updateData)
}

export async function assignTask(taskId: string, employeeId: string): Promise<void> {
  await updateTask(taskId, { assigneeId: employeeId })
}

export async function escalateTask(taskId: string): Promise<void> {
  const task = await getTask(taskId)
  if (!task) return
  
  await updateTask(taskId, {
    escalationCount: task.escalationCount + 1
  } as Partial<Task>)
}
