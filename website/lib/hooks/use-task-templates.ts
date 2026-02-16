'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import {
  getTaskTemplates,
  getTemplatesByType,
  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
  applyTemplate,
  duplicateTemplate,
  deactivateTemplate,
  activateTemplate,
  type TaskTemplate
} from '@/lib/services/task-template.service'
import { useAuth } from './use-auth'

export function useTaskTemplates(activeOnly = true) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const toast = useToast()

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTaskTemplates(activeOnly)
      setTemplates(data)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load task templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [activeOnly])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const createTemplate = useCallback(
    async (data: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount' | 'createdBy'>) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const templateId = await createTaskTemplate({
          ...data,
          createdBy: user.uid
        })

        toast({
          title: 'Template Created',
          description: 'Task template created successfully',
          status: 'success',
          duration: 3000
        })

        await loadTemplates()
        return templateId
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create template',
          status: 'error',
          duration: 5000
        })
        throw err
      }
    },
    [user, toast, loadTemplates]
  )

  const updateTemplate = useCallback(
    async (templateId: string, data: Partial<TaskTemplate>) => {
      try {
        await updateTaskTemplate(templateId, data)

        toast({
          title: 'Template Updated',
          description: 'Task template updated successfully',
          status: 'success',
          duration: 3000
        })

        await loadTemplates()
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to update template',
          status: 'error',
          duration: 5000
        })
        throw err
      }
    },
    [toast, loadTemplates]
  )

  const removeTemplate = useCallback(
    async (templateId: string) => {
      try {
        await deleteTaskTemplate(templateId)

        toast({
          title: 'Template Deleted',
          description: 'Task template deleted successfully',
          status: 'success',
          duration: 3000
        })

        await loadTemplates()
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete template',
          status: 'error',
          duration: 5000
        })
        throw err
      }
    },
    [toast, loadTemplates]
  )

  const duplicate = useCallback(
    async (templateId: string) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const newTemplateId = await duplicateTemplate(templateId, user.uid)

        toast({
          title: 'Template Duplicated',
          description: 'Task template duplicated successfully',
          status: 'success',
          duration: 3000
        })

        await loadTemplates()
        return newTemplateId
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to duplicate template',
          status: 'error',
          duration: 5000
        })
        throw err
      }
    },
    [user, toast, loadTemplates]
  )

  const apply = useCallback(
    async (templateId: string, customizations?: Parameters<typeof applyTemplate>[1]) => {
      try {
        const taskData = await applyTemplate(templateId, customizations)

        toast({
          title: 'Template Applied',
          description: 'Template applied successfully',
          status: 'success',
          duration: 2000
        })

        return taskData
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to apply template',
          status: 'error',
          duration: 5000
        })
        throw err
      }
    },
    [toast]
  )

  const deactivate = useCallback(
    async (templateId: string) => {
      try {
        await deactivateTemplate(templateId)

        toast({
          title: 'Template Deactivated',
          description: 'Task template deactivated',
          status: 'success',
          duration: 3000
        })

        await loadTemplates()
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to deactivate template',
          status: 'error',
          duration: 5000
        })
        throw err
      }
    },
    [toast, loadTemplates]
  )

  const activate = useCallback(
    async (templateId: string) => {
      try {
        await activateTemplate(templateId)

        toast({
          title: 'Template Activated',
          description: 'Task template activated',
          status: 'success',
          duration: 3000
        })

        await loadTemplates()
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to activate template',
          status: 'error',
          duration: 5000
        })
        throw err
      }
    },
    [toast, loadTemplates]
  )

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    removeTemplate,
    duplicate,
    apply,
    deactivate,
    activate,
    refetch: loadTemplates
  }
}

export function useTaskTemplatesByType(taskType: TaskTemplate['type']) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true)
        const data = await getTemplatesByType(taskType)
        setTemplates(data)
      } catch (err) {
        console.error('Failed to load templates by type:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [taskType])

  return { templates, isLoading }
}
