'use client'

import { memo, useMemo } from 'react'
import { Badge, HStack, Text, Tooltip } from '@chakra-ui/react'
import type { EmployeeAvailability } from '../../lib/types/employee'
import { EMPLOYEE_AVAILABILITY } from '../../lib/constants/roles'

interface AvailabilityIndicatorProps {
  readonly availability: EmployeeAvailability
  readonly showLabel?: boolean
  readonly size?: 'sm' | 'md' | 'lg'
  readonly showTooltip?: boolean
}

export const AvailabilityIndicator = memo<AvailabilityIndicatorProps>(({ 
  availability,
  showLabel = true,
  size = 'md',
  showTooltip = true
}) => {
  const badgeConfig = useMemo(() => {
    switch (availability) {
      case 'AVAILABLE':
        return {
          color: 'green',
          text: 'Available',
          icon: '🟢'
        }
      case 'BUSY':
        return {
          color: 'yellow',
          text: 'Busy',
          icon: '🟡'
        }
      case 'OFF_DUTY':
        return {
          color: 'gray',
          text: 'Off Duty',
          icon: '⚪'
        }
      default:
        return {
          color: 'gray',
          text: 'Unknown',
          icon: '❓'
        }
    }
  }, [availability])

  const badgeSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'

  const content = (
    <HStack spacing={1}>
      {showLabel && (
        <Badge 
          colorScheme={badgeConfig.color as 'green' | 'yellow' | 'gray'} 
          size={badgeSize}
          variant={availability === 'OFF_DUTY' ? 'outline' : 'solid'}
        >
          {EMPLOYEE_AVAILABILITY[availability]}
        </Badge>
      )}
      <Text fontSize={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'}>
        {badgeConfig.icon}
      </Text>
    </HStack>
  )

  if (showTooltip) {
    return (
      <Tooltip label={badgeConfig.text} hasArrow placement="top">
        {content}
      </Tooltip>
    )
  }

  return content
})

AvailabilityIndicator.displayName = 'AvailabilityIndicator'
