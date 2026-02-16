'use client'

import { useState, useEffect } from 'react'
import {
  getTimelineForTask,
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
  type TimelineEvent
} from '@/lib/services/task-timeline.service'

export function useTaskTimeline(taskId: string) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getTimelineForTask(taskId)
        setEvents(data)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to load task timeline:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTimeline()
  }, [taskId])

  return {
    events,
    isLoading,
    error,
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
    logReminderSent
  }
}
