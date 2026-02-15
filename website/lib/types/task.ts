export type TaskStatus =
  | 'DRAFT'
  | 'SENT'
  | 'READ'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'REJECTED'
  | 'OVERDUE'
  | 'CANCELLED'

export type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'

export type TaskType =
  | 'BREAKING_NEWS'
  | 'PRESS_CONF'
  | 'INTERVIEW'
  | 'PHOTO_ASSIGN'
  | 'VIDEO_ASSIGN'
  | 'FACT_CHECK'
  | 'FOLLOW_UP'
  | 'CUSTOM'

export interface TaskDeliverables {
  readonly photos?: number
  readonly videos?: number
  readonly quotes?: number
  readonly articles?: number
}

export interface TaskLocation {
  readonly latitude?: number
  readonly longitude?: number
  readonly address?: string
}

export interface Task {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly type: TaskType
  readonly priority: TaskPriority
  readonly status: TaskStatus
  readonly assigneeId: string | null
  readonly creatorId: string
  readonly newsItemId: string | null
  readonly whatsappThreadId: string | null
  readonly location: TaskLocation | null
  readonly deadline: Date | null
  readonly estimatedDuration: number | null
  readonly budget: number | null
  readonly deliverables: TaskDeliverables | null
  readonly createdAt: Date
  readonly sentAt: Date | null
  readonly readAt: Date | null
  readonly acceptedAt: Date | null
  readonly startedAt: Date | null
  readonly completedAt: Date | null
  readonly reviewedAt: Date | null
  readonly responseTime: number | null
  readonly completionTime: number | null
  readonly qualityRating: number | null
  readonly escalationCount: number
  readonly lastReminderSent: Date | null
}

export interface TaskFormData {
  readonly title: string
  readonly description: string
  readonly type: TaskType
  readonly priority: TaskPriority
  readonly assigneeId: string | null
  readonly deadline: Date | null
  readonly estimatedDuration: number | null
  readonly budget: number | null
  readonly deliverables: TaskDeliverables | null
  readonly location: TaskLocation | null
}

export interface TaskFilters {
  readonly status?: TaskStatus
  readonly priority?: TaskPriority
  readonly type?: TaskType
  readonly assigneeId?: string
  readonly dateFrom?: Date
  readonly dateTo?: Date
  readonly search?: string
}
