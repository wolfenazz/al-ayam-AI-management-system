'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  Box, 
  Select, 
  HStack, 
  Text, 
  Avatar, 
  Badge, 
  VStack,
  useColorModeValue 
} from '@chakra-ui/react'
import type { Employee, EmployeeFilters } from '../../lib/types/employee'
import { EMPLOYEE_AVAILABILITY, EMPLOYEE_ROLE } from '../../lib/constants/roles'
import { EmployeeAvatar } from './employee-avatar'

interface EmployeeSelectorProps {
  readonly employees: readonly Employee[]
  readonly selectedId?: string | null
  readonly onSelectionChange: (employeeId: string | null) => void
  readonly filterByAvailability?: boolean
  readonly filterByRole?: Employee['role'][]
  readonly placeholder?: string
  readonly disabled?: boolean
}

export function EmployeeSelector({ 
  employees, 
  selectedId, 
  onSelectionChange,
  filterByAvailability = false,
  filterByRole,
  placeholder = 'Select an employee',
  disabled = false
}: EmployeeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const filteredEmployees = useMemo(() => {
    let result = [...employees]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(emp =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.role.toLowerCase().includes(searchLower)
      )
    }

    if (filterByAvailability) {
      result = result.filter(emp => emp.availability === 'AVAILABLE')
    }

    if (filterByRole && filterByRole.length > 0) {
      result = result.filter(emp => filterByRole.includes(emp.role))
    }

    return result
  }, [employees, searchTerm, filterByAvailability, filterByRole])

  const getEmployeeLabel = useCallback((employee: Employee) => {
    const availabilityBadge = (
      <Badge 
        size="sm" 
        colorScheme={employee.availability === 'AVAILABLE' ? 'green' : 'gray'}
        ml={2}
      >
        {EMPLOYEE_AVAILABILITY[employee.availability]}
      </Badge>
    )

    return (
      <HStack width="100%">
        <EmployeeAvatar employee={employee} size="sm" />
        <VStack align="start" spacing={0} flex={1}>
          <HStack>
            <Text fontWeight="medium">{employee.name}</Text>
            {availabilityBadge}
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {EMPLOYEE_ROLE[employee.role]} • {employee.department || 'No department'}
          </Text>
        </VStack>
      </HStack>
    )
  }, [])

  const selectedEmployee = useMemo(() => {
    return employees.find(emp => emp.id === selectedId)
  }, [employees, selectedId])

  return (
    <Box>
      <Select
        value={selectedId || ''}
        onChange={(e) => onSelectionChange(e.target.value || null)}
        placeholder={placeholder}
        disabled={disabled}
        borderColor={borderColor}
      >
        {filteredEmployees.map(employee => (
          <option 
            key={employee.id} 
            value={employee.id}
            style={{ padding: '8px' }}
          >
            {employee.name} - {EMPLOYEE_ROLE[employee.role]}
          </option>
        ))}
      </Select>

      {selectedEmployee && (
        <HStack mt={2} p={3} borderWidth={1} borderRadius="md" borderColor={borderColor}>
          <EmployeeAvatar employee={selectedEmployee} size="md" />
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium" color={textColor}>
              {selectedEmployee.name}
            </Text>
            <HStack>
              <Badge colorScheme={selectedEmployee.availability === 'AVAILABLE' ? 'green' : 'gray'}>
                {EMPLOYEE_AVAILABILITY[selectedEmployee.availability]}
              </Badge>
              <Badge variant="outline">
                {EMPLOYEE_ROLE[selectedEmployee.role]}
              </Badge>
            </HStack>
          </VStack>
        </HStack>
      )}

      {filteredEmployees.length === 0 && searchTerm && (
        <Text color="gray.500" fontSize="sm" mt={2}>
          No employees found matching &ldquo;{searchTerm}&rdquo;
        </Text>
      )}

      <Text color="gray.500" fontSize="sm" mt={1}>
        Showing {filteredEmployees.length} of {employees.length} employees
      </Text>
    </Box>
  )
}
