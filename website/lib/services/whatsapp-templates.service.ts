import type { Task, TaskType, TaskPriority } from '../types/task'
import type { Employee } from '../types/employee'

export interface MessageTemplateParams {
  readonly task: Task
  readonly employee: Employee
  readonly includeQuickReplies?: boolean
}

export interface MessageTemplate {
  readonly message: string
  readonly quickReplies?: readonly string[]
}

export function generateTaskMessage(
  params: MessageTemplateParams
): MessageTemplate {
  const { task, employee, includeQuickReplies = true } = params

  const templates: Record<TaskType, () => MessageTemplate> = {
    BREAKING_NEWS: () => generateBreakingNewsMessage(task, employee),
    PRESS_CONF: () => generatePressConferenceMessage(task, employee),
    INTERVIEW: () => generateInterviewMessage(task, employee),
    PHOTO_ASSIGN: () => generatePhotoAssignmentMessage(task, employee),
    VIDEO_ASSIGN: () => generateVideoAssignmentMessage(task, employee),
    FACT_CHECK: () => generateFactCheckMessage(task, employee),
    FOLLOW_UP: () => generateFollowUpMessage(task, employee),
    CUSTOM: () => generateCustomTaskMessage(task, employee)
  }

  const template = templates[task.type]()

  if (includeQuickReplies) {
    return {
      message: template.message,
      quickReplies: getQuickRepliesForStatus(task.status)
    }
  }

  return template
}

function getPriorityEmoji(priority: TaskPriority): string {
  const emojis: Record<TaskPriority, string> = {
    URGENT: '🚨',
    HIGH: '⚡',
    NORMAL: '📋',
    LOW: '📝'
  }
  return emojis[priority]
}

function getQuickRepliesForStatus(status: Task['status']): readonly string[] {
  if (status === 'SENT' || status === 'DRAFT') {
    return ['👍 ACCEPT', '❌ DECLINE', '📞 CALL']
  } else if (status === 'ACCEPTED') {
    return ['STARTED', 'On my way', 'Need info']
  } else if (status === 'IN_PROGRESS') {
    return ['DONE', 'Almost done', 'Running late']
  }
  return []
}

function formatDeadline(deadline: Date | null): string {
  if (!deadline) return 'No deadline'

  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `in ${days} day${days > 1 ? 's' : ''}`
  }

  if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`
  }

  return `in ${minutes} minutes`
}

function formatLocation(location: Task['location']): string {
  if (!location) return ''

  const parts: string[] = []
  if (location.address) parts.push(location.address)
  if (location.latitude && location.longitude) {
    parts.push(
      `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    )
  }
  return parts.join('\n')
}

function generateBreakingNewsMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `${getPriorityEmoji(task.priority)} BREAKING NEWS ASSIGNMENT\n\n`
  message += `Hi ${employee.name},\n\n`

  if (task.location) {
    message += `${formatLocation(task.location)}\n`
  }

  message += `📰 Story: ${task.title}\n\n`
  message += `${task.description}\n\n`

  if (task.deadline) {
    message += `⏰ Deadline: ${formatDeadline(task.deadline)}\n`
  }

  if (task.deliverables) {
    message += `\nRequired:\n`
    if (task.deliverables.photos)
      message += `- Photos (minimum ${task.deliverables.photos})\n`
    if (task.deliverables.videos)
      message += `- Videos (minimum ${task.deliverables.videos})\n`
    if (task.deliverables.quotes)
      message += `- Quotes (minimum ${task.deliverables.quotes})\n`
  }

  if (task.budget) {
    message += `\n💰 Budget: BD ${task.budget}\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

function generatePressConferenceMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `📢 PRESS CONFERENCE\n\n`
  message += `Hi ${employee.name},\n\n`

  message += `🏛️ Event: ${task.title}\n`

  if (task.location) {
    message += `📍 ${formatLocation(task.location)}\n`
  }

  if (task.deadline) {
    message += `📅 Date: ${task.deadline.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`
  }

  message += `\n${task.description}\n`

  if (task.deliverables) {
    message += `\nCoverage Requirements:\n`
    if (task.deliverables.photos) message += `- Photos (${task.deliverables.photos})\n`
    if (task.deliverables.quotes) message += `- Quotes (${task.deliverables.quotes})\n`
    if (task.deliverables.articles) message += `- Article\n`
  }

  if (task.budget) {
    message += `\n💰 Budget: BD ${task.budget}\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

function generateInterviewMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `🎤 INTERVIEW REQUEST\n\n`
  message += `Hi ${employee.name},\n\n`

  message += `📋 Topic: ${task.title}\n`

  if (task.location) {
    message += `📍 ${formatLocation(task.location)}\n`
  }

  if (task.deadline) {
    message += `⏰ Deadline: ${formatDeadline(task.deadline)}\n`
  }

  message += `\n${task.description}\n`

  if (task.deliverables) {
    message += `\nRequirements:\n`
    if (task.deliverables.quotes) message += `- Quotes (${task.deliverables.quotes})\n`
    if (task.deliverables.photos) message += `- Photos (${task.deliverables.photos})\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

function generatePhotoAssignmentMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `📸 PHOTO ASSIGNMENT\n\n`
  message += `Hi ${employee.name},\n\n`

  message += `🎯 Event: ${task.title}\n`

  if (task.location) {
    message += `📍 ${formatLocation(task.location)}\n`
  }

  if (task.deadline) {
    message += `⏰ Deadline: ${formatDeadline(task.deadline)}\n`
  }

  message += `\n${task.description}\n`

  if (task.deliverables) {
    const photoCount = task.deliverables.photos || 10
    message += `\nRequired: ${photoCount} high-quality photos\n`
  }

  if (task.budget) {
    message += `\n💰 Budget: BD ${task.budget}\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

function generateVideoAssignmentMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `🎥 VIDEO ASSIGNMENT\n\n`
  message += `Hi ${employee.name},\n\n`

  message += `🎯 Event: ${task.title}\n`

  if (task.location) {
    message += `📍 ${formatLocation(task.location)}\n`
  }

  if (task.deadline) {
    message += `⏰ Deadline: ${formatDeadline(task.deadline)}\n`
  }

  message += `\n${task.description}\n`

  if (task.deliverables) {
    const videoCount = task.deliverables.videos || 1
    message += `\nRequired: ${videoCount} video clip(s)\n`
    message += `- Duration: 1-3 minutes each\n`
  }

  if (task.budget) {
    message += `\n💰 Budget: BD ${task.budget}\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

function generateFactCheckMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `🔍 FACT-CHECK MISSION\n\n`
  message += `Hi ${employee.name},\n\n`

  message += `📋 Topic: ${task.title}\n\n`

  message += `${task.description}\n`

  if (task.deadline) {
    message += `\n⏰ Deadline: ${formatDeadline(task.deadline)}\n`
  }

  message += `\nVerification Required:\n`
  message += `- Fact-check the claims\n`
  message += `- Source verification\n`
  message += `- Provide evidence\n`

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

function generateFollowUpMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `📰 FOLLOW-UP STORY\n\n`
  message += `Hi ${employee.name},\n\n`

  message += `📋 Topic: ${task.title}\n`

  if (task.location) {
    message += `📍 ${formatLocation(task.location)}\n`
  }

  if (task.deadline) {
    message += `⏰ Deadline: ${formatDeadline(task.deadline)}\n`
  }

  message += `\n${task.description}\n`

  if (task.deliverables) {
    message += `\nDeliverables:\n`
    if (task.deliverables.articles) message += `- Article (${task.deliverables.articles})\n`
    if (task.deliverables.photos) message += `- Photos (${task.deliverables.photos})\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

function generateCustomTaskMessage(
  task: Task,
  employee: Employee
): MessageTemplate {
  let message = `${getPriorityEmoji(task.priority)} TASK ASSIGNMENT\n\n`
  message += `Hi ${employee.name},\n\n`

  message += `📋 ${task.title}\n\n`

  if (task.location) {
    message += `📍 ${formatLocation(task.location)}\n`
  }

  if (task.deadline) {
    message += `⏰ Deadline: ${formatDeadline(task.deadline)}\n`
  }

  message += `${task.description}\n`

  if (task.deliverables) {
    message += `\nRequirements:\n`
    if (task.deliverables.photos)
      message += `- Photos (${task.deliverables.photos})\n`
    if (task.deliverables.videos)
      message += `- Videos (${task.deliverables.videos})\n`
    if (task.deliverables.quotes)
      message += `- Quotes (${task.deliverables.quotes})\n`
    if (task.deliverables.articles)
      message += `- Articles (${task.deliverables.articles})\n`
  }

  if (task.budget) {
    message += `\n💰 Budget: BD ${task.budget}\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return { message }
}

export function generateReminderMessage(
  task: Task,
  employee: Employee,
  reminderType: 'GENTLE' | 'URGENT' | 'ESCALATION'
): string {
  const timeLeft = task.deadline
    ? formatDeadline(task.deadline)
    : 'as soon as possible'

  let message = `⏰ REMINDER\n\n`
  message += `Hi ${employee.name},\n\n`

  if (reminderType === 'GENTLE') {
    message += `Just a friendly reminder about the task:\n`
    message += `📋 ${task.title}\n`
    message += `⏰ Due ${timeLeft}\n\n`
    message += `Please confirm if you're still working on it.\n`
  } else if (reminderType === 'URGENT') {
    message += `⚠️ URGENT REMINDER\n\n`
    message += `Task deadline approaching:\n`
    message += `📋 ${task.title}\n`
    message += `⏰ Due ${timeLeft}\n\n`
    message += `Please update the status ASAP.\n`
  } else if (reminderType === 'ESCALATION') {
    message += `🚨 ESCALATION ALERT\n\n`
    message += `Task has been escalated to management:\n`
    message += `📋 ${task.title}\n`
    message += `⏰ Was due ${timeLeft}\n\n`
    message += `Please contact your supervisor immediately.\n`
  }

  message += `\nTask ID: #${task.id.slice(-6)}`

  return message
}

export function generateStatusUpdateMessage(
  task: Task,
  newStatus: Task['status'],
  employeeName: string
): string {
  let message = `✓ STATUS UPDATE\n\n`
  message += `${employeeName} has updated the task:\n\n`
  message += `📋 ${task.title}\n`
  message += `Status: ${newStatus}\n\n`
  message += `Task ID: #${task.id.slice(-6)}`

  return message
}
