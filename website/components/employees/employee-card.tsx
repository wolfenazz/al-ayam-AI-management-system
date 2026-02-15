'use client'

import { memo, useMemo } from 'react'
import { Box, Avatar, HStack, Text, Badge, useColorModeValue } from '@chakra-ui/react'
import type { Employee } from '../../lib/types/employee'
import { EMPLOYEE_AVAILABILITY, ROLE_PERMISSIONS } from '../../lib/constants/roles'

interface EmployeeCardProps {
  readonly employee: Employee
  readonly onClick?: () => void
}

export const EmployeeCard = memo<EmployeeCardProps>(({ employee, onClick }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  const availabilityColor = useMemo(() => {
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
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      bg={bgColor}
      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="background 0.2s"
    >
      <HStack spacing={3}>
        <Avatar size="md" name={employee.name} />

        <Box flex={1}>
          <HStack justify="space-between" mb={1}>
            <Text fontWeight="semibold" color={textColor}>
              {employee.name}
            </Text>
            <Badge size="sm" colorScheme={employee.availability === 'AVAILABLE' ? 'green' : 'gray'}>
              {EMPLOYEE_AVAILABILITY[employee.availability]}
            </Badge>
          </HStack>

          <Text color="gray.500" fontSize="sm" mb={2}>
            {employee.role}
          </Text>

          <HStack spacing={2} flexWrap="wrap">
            {employee.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="subtle" fontSize="xs">
                {skill}
              </Badge>
            ))}
            {employee.skills.length > 3 && (
              <Badge variant="subtle" fontSize="xs">
                +{employee.skills.length - 3}
              </Badge>
            )}
          </HStack>
        </Box>
      </HStack>
    </Box>
  )
})

EmployeeCard.displayName = 'EmployeeCard'
