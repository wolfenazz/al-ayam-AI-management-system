'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import {
  dispatchTaskToEmployee,
  getTask
} from '../services/task.service'
import {
  sendWhatsAppMessage,
  handleIncomingMessage,
  verifyWebhook
} from '../services/whatsapp.service'
import {
  notifyTaskAssigned,
  notifyTaskAccepted,
  notifyTaskCompleted
} from '../services/notification.service'
import { generateTaskMessage } from '../services/whatsapp-templates.service'
import type { Task } from '../types/task'
import type { Employee } from '../types/employee'

export function useWhatsApp() {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const dispatchTask = useCallback(
    async (task: Task, employee: Employee) => {
      if (!employee.whatsappUid) {
        toast({
          title: 'Error',
          description: 'Employee does not have a WhatsApp number',
          status: 'error',
          duration: 5000
        })
        return
      }

      try {
        setIsLoading(true)

        await dispatchTaskToEmployee(task.id, employee)

        await notifyTaskAssigned(employee.id, task)

        toast({
          title: 'Success',
          description: `Task dispatched to ${employee.name} via WhatsApp`,
          status: 'success',
          duration: 3000
        })

        return task.id
      } catch (error) {
        console.error('Failed to dispatch task:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to dispatch task via WhatsApp',
          status: 'error',
          duration: 5000
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [toast]
  )

  const sendMessage = useCallback(
    async (taskId: string, employee: Employee, message: string) => {
      if (!employee.whatsappUid) {
        toast({
          title: 'Error',
          description: 'Employee does not have a WhatsApp number',
          status: 'error',
          duration: 5000
        })
        return
      }

      try {
        setIsLoading(true)

        await sendWhatsAppMessage({
          taskId,
          recipientId: employee.id,
          recipientPhone: employee.whatsappUid,
          message
        })

        toast({
          title: 'Message Sent',
          description: 'Message sent successfully',
          status: 'success',
          duration: 2000
        })
      } catch (error) {
        console.error('Failed to send message:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to send WhatsApp message',
          status: 'error',
          duration: 5000
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [toast]
  )

  const handleMessageAction = useCallback(
    async (taskId: string, employee: Employee, action: string) => {
      try {
        setIsLoading(true)

        const task = await getTask(taskId)
        if (!task) {
          throw new Error('Task not found')
        }

        let newStatus: Task['status'] | null = null

        const lowerAction = action.toLowerCase()

        if (
          lowerAction.includes('accept') ||
          lowerAction.includes('yes') ||
          lowerAction.includes('ok')
        ) {
          if (task.status === 'SENT' || task.status === 'DRAFT') {
            newStatus = 'ACCEPTED'
          }
        } else if (
          lowerAction.includes('decline') ||
          lowerAction.includes('no')
        ) {
          newStatus = 'DECLINED'
        } else if (
          lowerAction.includes('started') ||
          lowerAction.includes('progress')
        ) {
          if (task.status === 'ACCEPTED' || task.status === 'SENT') {
            newStatus = 'IN_PROGRESS'
          }
        } else if (
          lowerAction.includes('done') ||
          lowerAction.includes('complete')
        ) {
          newStatus = 'COMPLETED'
        }

        if (newStatus) {
          await dispatchTaskToEmployee(taskId, employee)

          if (newStatus === 'ACCEPTED') {
            await notifyTaskAccepted(employee.id, task.id, employee.name)
          } else if (newStatus === 'COMPLETED') {
            await notifyTaskCompleted(employee.id, task.id, employee.name)
          }

          toast({
            title: 'Status Updated',
            description: `Task status changed to ${newStatus}`,
            status: 'success',
            duration: 2000
          })

          return newStatus
        }

        await sendMessage(taskId, employee, action)
      } catch (error) {
        console.error('Failed to handle message action:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to handle message action',
          status: 'error',
          duration: 5000
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [toast, sendMessage]
  )

  const previewMessage = useCallback((task: Task, employee: Employee) => {
    const { message } = generateTaskMessage({
      task,
      employee,
      includeQuickReplies: true
    })
    return message
  }, [])

  return {
    isLoading,
    dispatchTask,
    sendMessage,
    handleMessageAction,
    previewMessage
  }
}
