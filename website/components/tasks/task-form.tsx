'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  useToast,
  HStack,
  VStack
} from '@chakra-ui/react'
import { createTask } from '@/lib/services/task.service'
import type { TaskFormData, TaskPriority, TaskType } from '@/lib/types/task'
import { TASK_TYPE, TASK_PRIORITY } from '@/lib/constants/task-status'

interface TaskFormProps {
  readonly onSuccess?: (taskId: string) => void
  readonly onCancel?: () => void
}

export function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: 'CUSTOM',
    priority: 'NORMAL',
    assigneeId: null,
    deadline: null,
    estimatedDuration: null,
    budget: null,
    deliverables: null,
    location: null
  })

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.budget && formData.budget < 0) {
      newErrors.budget = 'Budget must be positive'
    }

    if (formData.estimatedDuration && formData.estimatedDuration < 0) {
      newErrors.estimatedDuration = 'Duration must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors in the form',
          status: 'error',
          duration: 3000
        })
        return
      }

      try {
        setIsSubmitting(true)
        const taskId = await createTask(formData)

        toast({
          title: 'Task Created',
          description: 'Task has been created successfully',
          status: 'success',
          duration: 3000
        })

        onSuccess?.(taskId)
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create task',
          status: 'error',
          duration: 5000
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm, toast, onSuccess]
  )

  const handleFieldChange = useCallback(<K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const isFormValid = useMemo(() => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      Object.keys(errors).length === 0
    )
  }, [formData.title, formData.description, errors])

  useEffect(() => {
    return () => {
      setFormData({
        title: '',
        description: '',
        type: 'CUSTOM',
        priority: 'NORMAL',
        assigneeId: null,
        deadline: null,
        estimatedDuration: null,
        budget: null,
        deliverables: null,
        location: null
      })
      setErrors({})
    }
  }, [])

  return (
    <Box as="form" onSubmit={handleSubmit} p={6}>
      <Heading size="md" mb={6}>
        Create New Task
      </Heading>

      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Enter task title"
          />
          <FormErrorMessage>{errors.title}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Enter task description"
            rows={4}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Type</FormLabel>
          <select
            value={formData.type}
            onChange={(e) => handleFieldChange('type', e.target.value as TaskType)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0'
            }}
          >
            {Object.entries(TASK_TYPE).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormControl>

        <FormControl>
          <FormLabel>Priority</FormLabel>
          <select
            value={formData.priority}
            onChange={(e) => handleFieldChange('priority', e.target.value as TaskPriority)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0'
            }}
          >
            {Object.entries(TASK_PRIORITY).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormControl>

        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.budget}>
            <FormLabel>Budget (BHD)</FormLabel>
            <Input
              type="number"
              value={formData.budget ?? ''}
              onChange={(e) => handleFieldChange('budget', e.target.value ? Number(e.target.value) : null)}
              placeholder="0.00"
            />
            <FormErrorMessage>{errors.budget}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.estimatedDuration}>
            <FormLabel>Duration (minutes)</FormLabel>
            <Input
              type="number"
              value={formData.estimatedDuration ?? ''}
              onChange={(e) => handleFieldChange('estimatedDuration', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
            />
            <FormErrorMessage>{errors.estimatedDuration}</FormErrorMessage>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={!isFormValid}
          >
            Create Task
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
