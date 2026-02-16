import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTimelineForTask,
  createTimelineEvent,
  logTaskCreated,
  logTaskAssigned,
  logTaskSent,
  logTaskAccepted,
  logTaskDeclined,
  logTaskStarted,
  logTaskCompleted,
  logTaskEscalated,
  logMessageSent,
  logMessageReceived,
  logMediaUploaded,
  logReminderSent,
  getEventIcon,
  getEventColor,
  getEventTitle,
  type TimelineEvent
} from '@/lib/services/task-timeline.service'

vi.mock('@/lib/firebase/firestore', () => ({
  createDocument: vi.fn()
}))

describe('TaskTimelineService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTimelineEvent', () => {
    it('should create a new timeline event', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      const eventId = await createTimelineEvent(
        'task-1',
        'CREATED',
        'user-1',
        'John Doe',
        'Test event',
        { test: 'data' }
      )

      expect(eventId).toBe('event-1')
      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          taskId: 'task-1',
          eventType: 'CREATED',
          userId: 'user-1',
          userName: 'John Doe',
          description: 'Test event',
          metadata: { test: 'data' },
          createdAt: expect.any(Date)
        })
      )
    })

    it('should handle null metadata', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await createTimelineEvent(
        'task-1',
        'CREATED',
        'user-1',
        'John Doe',
        'Test event',
        null
      )

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          metadata: null
        })
      )
    })
  })

  describe('logTaskCreated', () => {
    it('should log task creation event', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskCreated('task-1', 'user-1', 'John Doe', 'Test Task')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'CREATED',
          description: 'Created task "Test Task"',
          metadata: { taskTitle: 'Test Task' }
        })
      )
    })
  })

  describe('logTaskAssigned', () => {
    it('should log task assignment event', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskAssigned('task-1', 'user-1', 'Manager', 'Jane Smith')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'ASSIGNED',
          description: 'Assigned task to Jane Smith',
          metadata: { assigneeName: 'Jane Smith' }
        })
      )
    })
  })

  describe('logTaskSent', () => {
    it('should log task sent event', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskSent('task-1', 'user-1', 'Manager', 'WhatsApp')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'SENT',
          description: 'Task sent via WhatsApp',
          metadata: { channel: 'WhatsApp' }
        })
      )
    })
  })

  describe('logTaskAccepted', () => {
    it('should log task accepted event', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskAccepted('task-1', 'user-1', 'John Doe')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'ACCEPTED',
          description: 'Accepted task',
          metadata: null
        })
      )
    })
  })

  describe('logTaskDeclined', () => {
    it('should log task declined event without reason', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskDeclined('task-1', 'user-1', 'John Doe')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'DECLINED',
          description: 'Declined task',
          metadata: { reason: undefined }
        })
      )
    })

    it('should log task declined event with reason', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskDeclined('task-1', 'user-1', 'John Doe', 'Not available')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'DECLINED',
          description: 'Declined task: Not available',
          metadata: { reason: 'Not available' }
        })
      )
    })
  })

  describe('logTaskCompleted', () => {
    it('should log task completed event without rating', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskCompleted('task-1', 'user-1', 'John Doe')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'COMPLETED',
          description: 'Completed task',
          metadata: null
        })
      )
    })

    it('should log task completed event with rating', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskCompleted('task-1', 'user-1', 'John Doe', 4)

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'COMPLETED',
          description: 'Completed task with quality rating: 4/5',
          metadata: { qualityRating: 4 }
        })
      )
    })
  })

  describe('logTaskEscalated', () => {
    it('should log task escalated event', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logTaskEscalated('task-1', 'user-1', 'Manager', 2, 'No response')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'ESCALATED',
          description: 'Task escalated to level 2: No response',
          metadata: { escalationLevel: 2, reason: 'No response' }
        })
      )
    })
  })

  describe('logMediaUploaded', () => {
    it('should log media uploaded event', async () => {
      const { createDocument } = await import('@/lib/firebase/firestore')
      vi.mocked(createDocument).mockResolvedValue('event-1')

      await logMediaUploaded('task-1', 'user-1', 'John Doe', 'photo.jpg', 'image')

      expect(createDocument).toHaveBeenCalledWith(
        'tasks/task-1/timeline',
        expect.objectContaining({
          eventType: 'MEDIA_UPLOADED',
          description: 'Uploaded image: photo.jpg',
          metadata: { fileName: 'photo.jpg', fileType: 'image' }
        })
      )
    })
  })

  describe('getEventIcon', () => {
    it('should return correct icon for CREATED event', () => {
      expect(getEventIcon('CREATED')).toBe('📝')
    })

    it('should return correct icon for ACCEPTED event', () => {
      expect(getEventIcon('ACCEPTED')).toBe('✅')
    })

    it('should return correct icon for IN_PROGRESS event', () => {
      expect(getEventIcon('IN_PROGRESS')).toBe('⚡')
    })

    it('should return correct icon for COMPLETED event', () => {
      expect(getEventIcon('COMPLETED')).toBe('🎉')
    })

    it('should return correct icon for ESCALATED event', () => {
      expect(getEventIcon('ESCALATED')).toBe('🚨')
    })

    it('should return correct icon for MEDIA_UPLOADED event', () => {
      expect(getEventIcon('MEDIA_UPLOADED')).toBe('📎')
    })
  })

  describe('getEventColor', () => {
    it('should return blue for CREATED event', () => {
      expect(getEventColor('CREATED')).toBe('blue')
    })

    it('should return green for ACCEPTED event', () => {
      expect(getEventColor('ACCEPTED')).toBe('green')
    })

    it('should return red for DECLINED event', () => {
      expect(getEventColor('DECLINED')).toBe('red')
    })

    it('should return orange for IN_PROGRESS event', () => {
      expect(getEventColor('IN_PROGRESS')).toBe('orange')
    })

    it('should return red for ESCALATED event', () => {
      expect(getEventColor('ESCALATED')).toBe('red')
    })

    it('should return purple for MEDIA_UPLOADED event', () => {
      expect(getEventColor('MEDIA_UPLOADED')).toBe('purple')
    })
  })

  describe('getEventTitle', () => {
    it('should return correct title for each event type', () => {
      expect(getEventTitle('CREATED')).toBe('Task Created')
      expect(getEventTitle('ASSIGNED')).toBe('Task Assigned')
      expect(getEventTitle('SENT')).toBe('Task Sent')
      expect(getEventTitle('ACCEPTED')).toBe('Task Accepted')
      expect(getEventTitle('IN_PROGRESS')).toBe('In Progress')
      expect(getEventTitle('COMPLETED')).toBe('Task Completed')
      expect(getEventTitle('ESCALATED')).toBe('Task Escalated')
      expect(getEventTitle('MESSAGE_SENT')).toBe('Message Sent')
      expect(getEventTitle('MEDIA_UPLOADED')).toBe('Media Uploaded')
    })
  })
})
