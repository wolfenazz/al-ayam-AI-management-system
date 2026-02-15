import type { TaskStatus, TaskPriority, TaskType } from '../types/task'

export const TASK_STATUS: Record<TaskStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  READ: 'Read',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Under Review',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
} as const

export const TASK_PRIORITY: Record<TaskPriority, string> = {
  URGENT: 'Urgent',
  HIGH: 'High',
  NORMAL: 'Normal',
  LOW: 'Low'
} as const

export const TASK_TYPE: Record<TaskType, string> = {
  BREAKING_NEWS: 'Breaking News',
  PRESS_CONF: 'Press Conference',
  INTERVIEW: 'Interview',
  PHOTO_ASSIGN: 'Photo Assignment',
  VIDEO_ASSIGN: 'Video Assignment',
  FACT_CHECK: 'Fact Check',
  FOLLOW_UP: 'Follow-up Story',
  CUSTOM: 'Custom Task'
} as const

export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['READ', 'CANCELLED'],
  READ: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['REVIEW', 'COMPLETED', 'CANCELLED'],
  REVIEW: ['COMPLETED', 'IN_PROGRESS', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: [],
  OVERDUE: ['REVIEW', 'COMPLETED', 'CANCELLED'],
  CANCELLED: []
} as const

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  URGENT: 'red.500',
  HIGH: 'orange.500',
  NORMAL: 'blue.500',
  LOW: 'gray.500'
} as const

export const STATUS_COLORS: Record<TaskStatus, string> = {
  DRAFT: 'gray.400',
  SENT: 'blue.400',
  READ: 'blue.500',
  ACCEPTED: 'green.400',
  IN_PROGRESS: 'yellow.500',
  REVIEW: 'orange.400',
  COMPLETED: 'green.500',
  REJECTED: 'red.500',
  OVERDUE: 'red.600',
  CANCELLED: 'gray.500'
} as const
