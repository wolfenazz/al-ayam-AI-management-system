'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTask, getTasks, updateTask, assignTask } from '../services/task.service'
import type { Task, TaskFilters, TaskFormData } from '../types/task'

export function useTask(taskId: string) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTask() {
      try {
        const data = await getTask(taskId)
        setTask(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch task'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  return { task, isLoading, error }
}

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasks(filters)
        setTasks(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tasks'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [filters])

  return { tasks, isLoading, error }
}

export function useTaskActions() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTaskStatus = useCallback(
    async (taskId: string, status: Task['status']) => {
      try {
        setIsSubmitting(true)
        setError(null)
        await updateTask(taskId, { status })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update task'))
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    []
  )

  const assignEmployee = useCallback(
    async (taskId: string, employeeId: string) => {
      try {
        setIsSubmitting(true)
        setError(null)
        await assignTask(taskId, employeeId)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to assign task'))
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    []
  )

  return {
    isSubmitting,
    error,
    updateTaskStatus,
    assignEmployee
  }
}
