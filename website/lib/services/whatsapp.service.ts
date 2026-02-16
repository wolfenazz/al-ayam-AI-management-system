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
  WhatsAppMessage,
  MessageStatus
} from '../types/whatsapp'

const COLLECTION = 'task_messages'
const SUBCOLLECTION = 'messages'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'
const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

export interface SendMessageParams {
  readonly taskId: string
  readonly recipientId: string
  readonly recipientPhone: string
  readonly message: string
  readonly mediaUrl?: string | null
  readonly mediaType?: string | null
  readonly quickReplies?: readonly string[]
}

export interface ParsedMessageResponse {
  readonly action: 'ACCEPT' | 'DECLINE' | 'PROGRESS' | 'COMPLETE' | 'DELAY' | 'UNKNOWN'
  readonly confidence: number
  readonly extractedInfo?: {
    readonly location?: { readonly latitude: number; readonly longitude: number }
    readonly contact?: string
    readonly budget?: number
    readonly note?: string
  }
}

export const getWhatsAppMessage = cache(
  async (messageId: string): Promise<WhatsAppMessage | null> => {
    return getDocument<WhatsAppMessage>(COLLECTION, messageId)
  }
)

export const getMessagesForTask = cache(
  async (taskId: string): Promise<WhatsAppMessage[]> => {
    const snapshot = await getCollection<WhatsAppMessage>(
      `tasks/${taskId}/messages`,
      [orderBy('sentAt', 'asc')]
    )
    return snapshot.sort(
      (a, b) =>
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    )
  }
)

export const getMessagesForEmployee = cache(
  async (employeeId: string): Promise<WhatsAppMessage[]> => {
    const constraints: QueryConstraint[] = [
      where('senderId', '==', employeeId),
      orderBy('sentAt', 'desc')
    ]
    return getCollection<WhatsAppMessage>(COLLECTION, constraints)
  }
)

async function sendWhatsAppAPIRequest(
  to: string,
  message: string,
  mediaUrl?: string,
  quickReplies?: readonly string[]
): Promise<{ messageId: string; success: boolean }> {
  try {
    const body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to
    }

    if (mediaUrl) {
      body.type = 'image'
      body.image = { link: mediaUrl }
    } else {
      body.type = 'text'
      body.text = {
        body: message,
        preview_url: false
      }
    }

    if (quickReplies && quickReplies.length > 0) {
      body.interactive = {
        type: 'button',
        body: {
          text: message
        },
        action: {
          buttons: quickReplies.slice(0, 3).map((reply) => ({
            type: 'reply',
            reply: {
              id: reply.toLowerCase().replace(/\s+/g, '_'),
              title: reply
            }
          }))
        }
      }
      delete body.text
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', data)
      throw new Error(data.error?.message || 'Failed to send WhatsApp message')
    }

    return {
      messageId: data.messages?.[0]?.id || '',
      success: true
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    throw error
  }
}

export async function sendWhatsAppMessage(
  params: SendMessageParams
): Promise<string> {
  const { taskId, recipientId, recipientPhone, message, mediaUrl, quickReplies } =
    params

  const { messageId: whatsappMessageId, success } =
    await sendWhatsAppAPIRequest(
      recipientPhone,
      message,
      mediaUrl || undefined,
      quickReplies
    )

  if (!success) {
    throw new Error('Failed to send WhatsApp message')
  }

  const messageData: Omit<WhatsAppMessage, 'id'> = {
    taskId,
    senderId: recipientId,
    messageType: mediaUrl ? 'IMAGE' : 'TEXT',
    content: message,
    mediaUrl: mediaUrl || null,
    mediaType: null,
    mediaSize: null,
    location: null,
    whatsappMessageId,
    direction: 'OUTBOUND',
    status: 'SENT',
    sentAt: new Date(),
    deliveredAt: null,
    readAt: null,
    isSystemMessage: false,
    metadata: null
  }

  return createDocument(`tasks/${taskId}/${SUBCOLLECTION}`, messageData)
}

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus,
  metadata?: {
    readonly deliveredAt?: Date
    readonly readAt?: Date
  }
): Promise<void> {
  await updateDocument(`tasks/${messageId}/${SUBCOLLECTION}`, messageId, {
    status,
    ...metadata
  })
}

export function parseEmployeeResponse(
  message: string
): ParsedMessageResponse {
  const lowerMessage = message.toLowerCase().trim()

  const acceptPatterns = [
    /\b(accept|confirmed|yes|ok|sure|will do|on it|got it|👍|✅)\b/i,
    /^(yes|ok|sure)$/i
  ]

  const declinePatterns = [
    /\b(decline|no|can't|cannot|unable|not available|sorry|❌)\b/i,
    /^(no|nope)$/i
  ]

  const progressPatterns = [
    /\b(on my way|started|working on|in progress|arrived|at location|going|heading)\b/i,
    /^(started|going)$/i
  ]

  const completePatterns = [
    /\b(done|finished|complete|completed|ready|submitted|finished|✅)\b/i,
    /^(done|finished)$/i
  ]

  const delayPatterns = [
    /\b(running late|need more time|will be|delay|need extension)\b/i
  ]

  let action: ParsedMessageResponse['action'] = 'UNKNOWN'
  let confidence = 0

  for (const pattern of acceptPatterns) {
    if (pattern.test(lowerMessage)) {
      action = 'ACCEPT'
      confidence = 0.9
      break
    }
  }

  if (action === 'UNKNOWN') {
    for (const pattern of declinePatterns) {
      if (pattern.test(lowerMessage)) {
        action = 'DECLINE'
        confidence = 0.9
        break
      }
    }
  }

  if (action === 'UNKNOWN') {
    for (const pattern of progressPatterns) {
      if (pattern.test(lowerMessage)) {
        action = 'PROGRESS'
        confidence = 0.85
        break
      }
    }
  }

  if (action === 'UNKNOWN') {
    for (const pattern of completePatterns) {
      if (pattern.test(lowerMessage)) {
        action = 'COMPLETE'
        confidence = 0.9
        break
      }
    }
  }

  if (action === 'UNKNOWN') {
    for (const pattern of delayPatterns) {
      if (pattern.test(lowerMessage)) {
        action = 'DELAY'
        confidence = 0.8
        break
      }
    }
  }

  const budgetMatch = message.match(/(?:need|require)\s*(?:bd|bhd)?\s*\$?(\d+)/i)
  const phoneMatch = message.match(/(\+?973|0)?\d{8}/)
  const locationKeywords = ['at the', 'in', 'location', 'venue', 'address']
  const hasLocationKeyword = locationKeywords.some((keyword) => lowerMessage.includes(keyword))

  const extractedInfo: ParsedMessageResponse['extractedInfo'] = (budgetMatch || phoneMatch || hasLocationKeyword)
    ? {
        budget: budgetMatch ? parseFloat(budgetMatch[1]) : undefined,
        contact: phoneMatch ? phoneMatch[0] : undefined,
        note: hasLocationKeyword ? message : undefined
      }
    : undefined

  return {
    action,
    confidence,
    extractedInfo
  }
}

export async function handleIncomingMessage(
  webhookData: Record<string, unknown>
): Promise<{ success: boolean; taskId?: string }> {
  try {
    const entries = webhookData.entry as unknown[] | undefined
    const entry = entries?.[0] as Record<string, unknown> | undefined
    if (!entry) {
      return { success: false }
    }

    const changesList = entry.changes as unknown[] | undefined
    const changes = changesList?.[0] as Record<string, unknown> | undefined
    if (!changes || changes.field !== 'messages') {
      return { success: false }
    }

    const value = changes.value as Record<string, unknown>
    const messagesList = value.messages as unknown[] | undefined
    const message = messagesList?.[0] as Record<string, unknown> | undefined

    if (!message) {
      return { success: false }
    }

    const phoneNumber = message.from as string
    const messageId = message.id as string
    const timestamp = new Date(parseInt(message.timestamp as string) * 1000)
    const messageType = (message.type as string) || 'TEXT'

    let content: string | null = null
    let mediaUrl: string | null = null
    let mediaType: string | null = null
    const mediaSize: number | null = null
    let location:
      | {
          readonly latitude: number
          readonly longitude: number
          readonly address: string | null
        }
      | null = null

    if (messageType === 'text') {
      content = (message.text as { body: string })?.body || null
    } else if (messageType === 'image') {
      mediaUrl = (message.image as { id: string })?.id || null
      mediaType = 'image/jpeg'
    } else if (messageType === 'video') {
      mediaUrl = (message.video as { id: string })?.id || null
      mediaType = 'video/mp4'
    } else if (messageType === 'audio') {
      mediaUrl = (message.audio as { id: string })?.id || null
      mediaType = 'audio/mpeg'
    } else if (messageType === 'document') {
      mediaUrl = (message.document as { id: string })?.id || null
      mediaType = (message.document as { mime_type: string })?.mime_type || null
    } else if (messageType === 'location') {
      const loc = message.location as {
        latitude: number
        longitude: number
        name?: string
      }
      location = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.name || null
      }
    }

    const taskId = await findTaskByPhoneNumber(phoneNumber)

    if (!taskId) {
      console.warn('No task found for phone number:', phoneNumber)
      return { success: false }
    }

    const messageData = {
      taskId,
      senderId: phoneNumber,
      messageType: messageType.toUpperCase() as WhatsAppMessage['messageType'],
      content,
      mediaUrl,
      mediaType,
      mediaSize,
      location,
      whatsappMessageId: messageId,
      direction: 'INBOUND' as const,
      status: 'DELIVERED' as const,
      sentAt: timestamp,
      deliveredAt: timestamp,
      readAt: null,
      isSystemMessage: false,
      metadata: null
    }

    await createDocument(`tasks/${taskId}/messages`, messageData)

    return { success: true, taskId }
  } catch (error) {
    console.error('Error handling incoming message:', error)
    return { success: false }
  }
}

async function findTaskByPhoneNumber(
  phoneNumber: string
): Promise<string | null> {
  return null
}

export async function verifyWebhook(
  mode: string,
  token: string,
  challenge: string
): Promise<{ success: boolean; challenge?: string }> {
  const VERIFY_TOKEN = process.env.META_APP_SECRET

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return { success: true, challenge }
  }

  return { success: false }
}
