'use client'

import { memo, useMemo } from 'react'
import { Avatar, Badge, Box, useColorModeValue } from '@chakra-ui/react'
import type { Employee } from '../../lib/types/employee'

interface EmployeeAvatarProps {
  readonly employee: Employee
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  readonly showStatus?: boolean
  readonly onClick?: () => void
}

export const EmployeeAvatar = memo<EmployeeAvatarProps>(({ 
  employee, 
  size = 'md',
  showStatus = true,
  onClick 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  
  const statusColor = useMemo(() => {
    switch (employee.availability) {
      case 'AVAILABLE':
        return 'green.500'
      case 'BUSY':
        return 'yellow.500'
      case 'OFF_DUTY':
        return 'gray.500'
      default:
        return 'gray.500'
    }
  }, [employee.availability])

  return (
    <Box position="relative" display="inline-block" onClick={onClick} cursor={onClick ? 'pointer' : 'default'}>
      <Avatar 
        size={size} 
        name={employee.name}
        bg={bgColor}
      />
      {showStatus && (
        <Badge
          position="absolute"
          bottom={0}
          right={0}
          bg={statusColor}
          borderRadius="full"
          boxSize={size === 'xs' ? '8px' : size === 'sm' ? '10px' : size === 'md' ? '12px' : '14px'}
          borderWidth={2}
          borderColor={bgColor}
        />
      )}
    </Box>
  )
})

EmployeeAvatar.displayName = 'EmployeeAvatar'
