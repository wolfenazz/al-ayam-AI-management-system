'use client'

import { memo } from 'react'
import { Badge } from '@chakra-ui/react'
import type { TaskStatus } from '../../lib/types/task'
import { TASK_STATUS, STATUS_COLORS } from '../../lib/constants/task-status'

interface TaskStatusBadgeProps {
  readonly status: TaskStatus
  readonly showOverdue?: boolean
  readonly isOverdue?: boolean
}

export const TaskStatusBadge = memo<TaskStatusBadgeProps>(({ 
  status, 
  showOverdue = false,
  isOverdue = false
}) => {
  const badgeColor = showOverdue && isOverdue ? 'red.600' : STATUS_COLORS[status]
  
  return (
    <Badge bg={badgeColor} color="white" variant="solid">
      {showOverdue && isOverdue ? 'Overdue' : TASK_STATUS[status]}
    </Badge>
  )
})

TaskStatusBadge.displayName = 'TaskStatusBadge'
