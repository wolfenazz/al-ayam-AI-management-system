'use client'

import { memo, useMemo } from 'react'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'

interface DeadlineCounterProps {
  readonly deadline: Date | string
  readonly status: 'COMPLETED' | 'CANCELLED' | string
}

export const DeadlineCounter = memo<DeadlineCounterProps>(({ deadline, status }) => {
  const isCompleted = status === 'COMPLETED' || status === 'CANCELLED'
  const textColor = useColorModeValue('gray.700', 'gray.300')

  const timeRemaining = useMemo(() => {
    if (isCompleted) return null

    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
    const now = new Date()
    const diff = deadlineDate.getTime() - now.getTime()

    if (diff <= 0) return 'Overdue'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h remaining`
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }

    return `${minutes}m remaining`
  }, [deadline, isCompleted])

  const textColorClass = useMemo(() => {
    if (isCompleted) return 'gray.500'
    if (timeRemaining === 'Overdue') return 'red.500'
    return textColor
  }, [isCompleted, timeRemaining, textColor])

  if (!timeRemaining) return null

  return (
    <Box>
      <Text fontSize="xs" color={textColorClass}>
        {timeRemaining}
      </Text>
    </Box>
  )
})

DeadlineCounter.displayName = 'DeadlineCounter'
