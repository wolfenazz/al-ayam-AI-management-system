'use client'

import { memo } from 'react'
import { Box, Text, Badge, HStack } from '@chakra-ui/react'
import type { Task } from '../../lib/types/task'
import { TASK_STATUS, PRIORITY_COLORS, STATUS_COLORS } from '../../lib/constants/task-status'
import { DeadlineCounter } from './deadline-counter'

interface TaskCardProps {
  readonly task: Task
  readonly onClick?: () => void
  readonly onStatusChange?: (taskId: string, status: Task['status']) => void
}

export const TaskCard = memo<TaskCardProps>(({ task, onClick, onStatusChange }) => {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED'

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      bg="white"
      _hover={{ bg: 'gray.50' }}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="background 0.2s"
    >
      <HStack justify="space-between" mb={2}>
        <Badge bg={PRIORITY_COLORS[task.priority]} color="white">
          {task.priority}
        </Badge>
        <Badge bg={isOverdue ? 'red.600' : STATUS_COLORS[task.status]} color="white">
          {TASK_STATUS[task.status]}
        </Badge>
      </HStack>

      <Text fontWeight="semibold" mb={1} noOfLines={2}>
        {task.title}
      </Text>

      <Text color="gray.600" fontSize="sm" noOfLines={2} mb={3}>
        {task.description}
      </Text>

      {task.deadline && (
        <Box>
          <DeadlineCounter deadline={task.deadline} status={task.status} />
        </Box>
      )}
    </Box>
  )
})

TaskCard.displayName = 'TaskCard'
