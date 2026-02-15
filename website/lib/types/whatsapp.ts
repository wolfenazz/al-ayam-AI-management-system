export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'DOCUMENT'
  | 'LOCATION'
  | 'SYSTEM'

export type MessageDirection = 'OUTBOUND' | 'INBOUND'

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

export interface WhatsAppMessage {
  readonly id: string
  readonly taskId: string
  readonly senderId: string
  readonly messageType: MessageType
  readonly content: string | null
  readonly mediaUrl: string | null
  readonly mediaType: string | null
  readonly mediaSize: number | null
  readonly location: WhatsAppLocation | null
  readonly whatsappMessageId: string | null
  readonly direction: MessageDirection
  readonly status: MessageStatus
  readonly sentAt: Date
  readonly deliveredAt: Date | null
  readonly readAt: Date | null
  readonly isSystemMessage: boolean
  readonly metadata: Record<string, unknown> | null
}

export interface WhatsAppLocation {
  readonly latitude: number
  readonly longitude: number
  readonly address: string | null
}

export interface MessageFilters {
  readonly taskId?: string
  readonly senderId?: string
  readonly direction?: MessageDirection
  readonly messageType?: MessageType
  readonly dateFrom?: Date
  readonly dateTo?: Date
}
