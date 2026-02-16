import { describe, it, expect } from 'vitest'
import {
  generateTaskMessage,
  generateReminderMessage,
  generateStatusUpdateMessage
} from '@/lib/services/whatsapp-templates.service'
import type { Task, TaskType, TaskPriority } from '@/lib/types/task'
import type { Employee } from '@/lib/types/employee'

describe('generateTaskMessage', () => {
  const mockEmployee: Employee = {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john@example.com',
    whatsappUid: '+97312345678',
    phoneNumber: '+97312345678',
    role: 'JOURNALIST',
    department: 'News',
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    currentLocation: null,
    skills: ['interviews', 'photography'],
    performanceScore: 85,
    responseTimeAvg: 300,
    totalTasksCompleted: 50,
    createdAt: new Date('2024-01-01'),
    lastActive: new Date('2024-02-01'),
    managerId: 'manager-1'
  }

  const mockTask: Task = {
    id: 'task-1',
    title: 'Breaking News Coverage',
    description: 'Cover the emergency landing at Bahrain International Airport',
    type: 'BREAKING_NEWS',
    priority: 'URGENT',
    status: 'DRAFT',
    assigneeId: 'emp-1',
    creatorId: 'manager-1',
    newsItemId: null,
    whatsappThreadId: null,
    location: {
      latitude: 26.2708,
      longitude: 50.6336,
      address: 'Bahrain International Airport'
    },
    deadline: new Date('2024-02-17T10:00:00'),
    estimatedDuration: 120,
    budget: 50,
    deliverables: {
      photos: 5,
      videos: 2,
      quotes: 3
    },
    createdAt: new Date('2024-02-16T10:00:00'),
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

  it('should generate breaking news message with all details', () => {
    const result = generateTaskMessage({
      task: mockTask,
      employee: mockEmployee,
      includeQuickReplies: true
    })

    expect(result.message).toContain('🚨')
    expect(result.message).toContain('BREAKING NEWS ASSIGNMENT')
    expect(result.message).toContain(mockEmployee.name)
    expect(result.message).toContain(mockTask.title)
    expect(result.message).toContain(mockTask.description)
    expect(result.message).toContain(mockTask.location?.address || '')
    expect(result.message).toContain('BD 50')
    expect(result.message).toContain('5 photos')
    expect(result.message).toContain('2 videos')
    expect(result.message).toContain('3 quotes')
    expect(result.message).toContain('#task-1'.slice(-6))
    expect(result.quickReplies).toBeDefined()
    expect(result.quickReplies).toContain('👍 ACCEPT')
  })

  it('should generate press conference message', () => {
    const task: Task = {
      ...mockTask,
      type: 'PRESS_CONF',
      title: 'Ministry Press Conference'
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain('📢')
    expect(result.message).toContain('PRESS CONFERENCE')
    expect(result.message).toContain(task.title)
  })

  it('should generate interview request message', () => {
    const task: Task = {
      ...mockTask,
      type: 'INTERVIEW',
      title: 'Interview with Dr. Ahmed'
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain('🎤')
    expect(result.message).toContain('INTERVIEW REQUEST')
    expect(result.message).toContain(task.title)
  })

  it('should generate photo assignment message', () => {
    const task: Task = {
      ...mockTask,
      type: 'PHOTO_ASSIGN',
      deliverables: { photos: 10 }
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain('📸')
    expect(result.message).toContain('PHOTO ASSIGNMENT')
    expect(result.message).toContain('10 high-quality photos')
  })

  it('should generate video assignment message', () => {
    const task: Task = {
      ...mockTask,
      type: 'VIDEO_ASSIGN',
      deliverables: { videos: 2 }
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain('🎥')
    expect(result.message).toContain('VIDEO ASSIGNMENT')
    expect(result.message).toContain('2 video clip(s)')
  })

  it('should generate fact-check message', () => {
    const task: Task = {
      ...mockTask,
      type: 'FACT_CHECK',
      description: 'Verify claims about new policy'
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain('🔍')
    expect(result.message).toContain('FACT-CHECK MISSION')
    expect(result.message).toContain('Fact-check the claims')
  })

  it('should generate follow-up story message', () => {
    const task: Task = {
      ...mockTask,
      type: 'FOLLOW_UP'
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain('📰')
    expect(result.message).toContain('FOLLOW-UP STORY')
  })

  it('should generate custom task message', () => {
    const task: Task = {
      ...mockTask,
      type: 'CUSTOM',
      priority: 'HIGH'
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain('⚡')
    expect(result.message).toContain('TASK ASSIGNMENT')
  })

  it('should handle missing optional fields', () => {
    const task: Task = {
      ...mockTask,
      location: null,
      deadline: null,
      budget: null,
      deliverables: null
    }

    const result = generateTaskMessage({
      task,
      employee: mockEmployee
    })

    expect(result.message).toContain(task.title)
    expect(result.message).toContain(task.description)
  })

  it('should generate different quick replies based on status', () => {
    const sentTask: Task = { ...mockTask, status: 'SENT' }
    const acceptedTask: Task = { ...mockTask, status: 'ACCEPTED' }
    const inProgressTask: Task = { ...mockTask, status: 'IN_PROGRESS' }

    const sentResult = generateTaskMessage({
      task: sentTask,
      employee: mockEmployee,
      includeQuickReplies: true
    })
    const acceptedResult = generateTaskMessage({
      task: acceptedTask,
      employee: mockEmployee,
      includeQuickReplies: true
    })
    const inProgressResult = generateTaskMessage({
      task: inProgressTask,
      employee: mockEmployee,
      includeQuickReplies: true
    })

    expect(sentResult.quickReplies).toContain('👍 ACCEPT')
    expect(acceptedResult.quickReplies).toContain('STARTED')
    expect(inProgressResult.quickReplies).toContain('DONE')
  })
})

describe('generateReminderMessage', () => {
  const mockEmployee: Employee = {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john@example.com',
    whatsappUid: '+97312345678',
    phoneNumber: '+97312345678',
    role: 'JOURNALIST',
    department: 'News',
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    currentLocation: null,
    skills: [],
    performanceScore: 85,
    responseTimeAvg: 300,
    totalTasksCompleted: 50,
    createdAt: new Date('2024-01-01'),
    lastActive: new Date('2024-02-01'),
    managerId: 'manager-1'
  }

  const mockTask: Task = {
    id: 'task-1',
    title: 'Urgent Assignment',
    description: 'Cover breaking news',
    type: 'BREAKING_NEWS',
    priority: 'URGENT',
    status: 'SENT',
    assigneeId: 'emp-1',
    creatorId: 'manager-1',
    newsItemId: null,
    whatsappThreadId: null,
    location: null,
    deadline: new Date('2024-02-17T10:00:00'),
    estimatedDuration: 60,
    budget: 50,
    deliverables: null,
    createdAt: new Date('2024-02-16T10:00:00'),
    sentAt: new Date('2024-02-16T10:00:00'),
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

  it('should generate gentle reminder', () => {
    const result = generateReminderMessage(
      mockTask,
      mockEmployee,
      'GENTLE'
    )

    expect(result).toContain('⏰ REMINDER')
    expect(result).toContain('friendly reminder')
    expect(result).toContain(mockTask.title)
  })

  it('should generate urgent reminder', () => {
    const result = generateReminderMessage(
      mockTask,
      mockEmployee,
      'URGENT'
    )

    expect(result).toContain('⚠️ URGENT REMINDER')
    expect(result).toContain('deadline approaching')
    expect(result).toContain('ASAP')
  })

  it('should generate escalation reminder', () => {
    const result = generateReminderMessage(
      mockTask,
      mockEmployee,
      'ESCALATION'
    )

    expect(result).toContain('🚨 ESCALATION ALERT')
    expect(result).toContain('escalated to management')
    expect(result).toContain('supervisor')
  })
})

describe('generateStatusUpdateMessage', () => {
  it('should generate status update message', () => {
    const mockTask: Task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Description',
      type: 'CUSTOM',
      priority: 'NORMAL',
      status: 'ACCEPTED',
      assigneeId: 'emp-1',
      creatorId: 'manager-1',
      newsItemId: null,
      whatsappThreadId: null,
      location: null,
      deadline: null,
      estimatedDuration: 60,
      budget: null,
      deliverables: null,
      createdAt: new Date('2024-02-16T10:00:00'),
      sentAt: null,
      readAt: null,
      acceptedAt: new Date('2024-02-16T11:00:00'),
      startedAt: null,
      completedAt: null,
      reviewedAt: null,
      responseTime: null,
      completionTime: null,
      qualityRating: null,
      escalationCount: 0,
      lastReminderSent: null
    }

    const result = generateStatusUpdateMessage(mockTask, 'ACCEPTED', 'John Doe')

    expect(result).toContain('✓ STATUS UPDATE')
    expect(result).toContain('John Doe')
    expect(result).toContain('ACCEPTED')
    expect(result).toContain(mockTask.title)
  })
})
