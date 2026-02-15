'use client'

import { memo } from 'react'
import { Badge } from '@chakra-ui/react'
import type { TaskPriority } from '../../lib/types/task'
import { TASK_PRIORITY, PRIORITY_COLORS } from '../../lib/constants/task-status'

interface PriorityBadgeProps {
  readonly priority: TaskPriority
  readonly size?: 'sm' | 'md' | 'lg'
}

export const PriorityBadge = memo<PriorityBadgeProps>(({ priority, size = 'md' }) => {
  return (
    <Badge 
      bg={PRIORITY_COLORS[priority]} 
      color="white" 
      variant="solid"
      size={size}
    >
      {TASK_PRIORITY[priority]}
    </Badge>
  )
})

PriorityBadge.displayName = 'PriorityBadge'
