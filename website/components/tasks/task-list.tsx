'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Input, 
  Select, 
  Button, 
  useColorModeValue 
} from '@chakra-ui/react'
import { TaskCard } from './task-card'
import type { Task, TaskFilters } from '../../lib/types/task'
import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from '../../lib/constants/task-status'

interface TaskListProps {
  readonly tasks: readonly Task[]
  readonly onTaskClick?: (task: Task) => void
  readonly onStatusChange?: (taskId: string, status: Task['status']) => void
  readonly isLoading?: boolean
}

export function TaskList({ tasks, onTaskClick, onStatusChange, isLoading }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>({})
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status) {
      result = result.filter(task => task.status === filters.status)
    }

    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority)
    }

    if (filters.type) {
      result = result.filter(task => task.type === filters.type)
    }

    if (filters.dateFrom) {
      result = result.filter(task => new Date(task.createdAt) >= filters.dateFrom!)
    }

    if (filters.dateTo) {
      result = result.filter(task => new Date(task.createdAt) <= filters.dateTo!)
    }

    return result
  }, [tasks, filters])

  const updateFilter = useCallback(<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">Loading tasks...</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        borderColor={borderColor}
        bg={bgColor}
      >
        <Text fontWeight="semibold" mb={3}>Filters</Text>
        
        <VStack spacing={3}>
          <Input
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />

          <HStack spacing={2}>
            <Select
              placeholder="Status"
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value as Task['status'] | undefined)}
            >
              {Object.entries(TASK_STATUS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Select
              placeholder="Priority"
              value={filters.priority || ''}
              onChange={(e) => updateFilter('priority', e.target.value as Task['priority'] | undefined)}
            >
              {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Select
              placeholder="Type"
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value as Task['type'] | undefined)}
            >
              {Object.entries(TASK_TYPE).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>
          </HStack>

          <HStack spacing={2}>
            <Input
              type="date"
              placeholder="From"
              value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
            />
            <Input
              type="date"
              placeholder="To"
              value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFilter('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
            />
          </HStack>

          <Button onClick={clearFilters} variant="outline" size="sm">
            Clear Filters
          </Button>
        </VStack>
      </Box>

      <VStack spacing={3} align="stretch">
        {filteredTasks.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500">No tasks found</Text>
          </Box>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </VStack>

      <Text color="gray.500" fontSize="sm" textAlign="center">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </Text>
    </VStack>
  )
}
