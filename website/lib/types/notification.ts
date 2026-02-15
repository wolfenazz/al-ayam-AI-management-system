export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_ACCEPTED'
  | 'TASK_COMPLETED'
  | 'DEADLINE_APPROACHING'
  | 'OVERDUE'
  | 'ESCALATION'
  | 'MEDIA_UPLOADED'
  | 'SYSTEM'

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

export interface Notification {
  readonly id: string
  readonly recipientId: string
  readonly type: NotificationType
  readonly priority: NotificationPriority
  readonly title: string
  readonly message: string
  readonly actionUrl: string | null
  readonly taskId: string | null
  readonly channels: readonly NotificationChannel[]
  readonly status: NotificationStatus
  readonly createdAt: Date
  readonly sentAt: Date | null
  readonly readAt: Date | null
  readonly expiresAt: Date | null
}

export type NotificationChannel = 'dashboard' | 'email' | 'sms' | 'push' | 'whatsapp'

export interface NotificationFilters {
  readonly recipientId?: string
  readonly type?: NotificationType
  readonly priority?: NotificationPriority
  readonly status?: NotificationStatus
  readonly dateFrom?: Date
  readonly dateTo?: Date
  readonly isUnreadOnly?: boolean
}
