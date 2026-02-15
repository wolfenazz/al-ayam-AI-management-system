'use client'

import { useState, useCallback, useMemo, startTransition } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react'
import { TaskCard } from '@/components/tasks/task-card'
import { EmployeeCard } from '@/components/employees/employee-card'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useAvailableEmployees } from '@/lib/hooks/use-employees'
import { useTaskActions } from '@/lib/hooks/use-tasks'
import type { Task, TaskFilters } from '@/lib/types/task'
import type { TaskStatus, TaskPriority } from '@/lib/types/task'

export default function DashboardPage() {
  const [filters, setFilters] = useState<TaskFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const { tasks, isLoading: tasksLoading } = useTasks(filters)
  const { employees, isLoading: employeesLoading } = useAvailableEmployees()
  const { isSubmitting, updateTaskStatus } = useTaskActions()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    })
  }, [])

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks

    const query = searchQuery.toLowerCase()
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
    )
  }, [tasks, searchQuery])

  const tasksByStatus = useMemo(() => {
    return {
      draft: filteredTasks.filter((task) => task.status === 'DRAFT'),
      inProgress: filteredTasks.filter((task) => task.status === 'IN_PROGRESS'),
      completed: filteredTasks.filter((task) => task.status === 'COMPLETED')
    }
  }, [filteredTasks])

  const handleStatusChange = useCallback(
    async (taskId: string, status: Task['status']) => {
      try {
        await updateTaskStatus(taskId, status)
      } catch (error) {
        console.error('Failed to update task status:', error)
      }
    },
    [updateTaskStatus]
  )

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId)
  }, [selectedTaskId])

  if (tasksLoading || employeesLoading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading dashboard...</Text>
      </Box>
    )
  }

  return (
    <Box bg={bgColor} minH="screen" p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color={textColor}>
            Dashboard
          </Heading>
          <Text color="gray.500">Overview of tasks and team availability</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box bg={cardBg} p={4} borderRadius="md" borderWidth={1}>
            <Text fontSize="sm" color="gray.500" mb={1}>
              Pending Tasks
            </Text>
            <Heading size="2xl">{tasksByStatus.draft.length}</Heading>
          </Box>

          <Box bg={cardBg} p={4} borderRadius="md" borderWidth={1}>
            <Text fontSize="sm" color="gray.500" mb={1}>
              In Progress
            </Text>
            <Heading size="2xl">{tasksByStatus.inProgress.length}</Heading>
          </Box>

          <Box bg={cardBg} p={4} borderRadius="md" borderWidth={1}>
            <Text fontSize="sm" color="gray.500" mb={1}>
              Available Employees
            </Text>
            <Heading size="2xl">{employees.length}</Heading>
          </Box>
        </SimpleGrid>

        <HStack spacing={4} flexWrap="wrap">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxW="300px"
          />

          <Select
            placeholder="All Status"
            maxW="200px"
            onChange={(e) =>
              updateFilters({ status: e.target.value as TaskStatus })
            }
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </Select>

          <Select
            placeholder="All Priority"
            maxW="200px"
            onChange={(e) =>
              updateFilters({ priority: e.target.value as TaskPriority })
            }
          >
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </Select>

          <Button colorScheme="blue">Create Task</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box>
            <Heading size="md" mb={4} color={textColor}>
              Tasks
            </Heading>
            <VStack spacing={3} align="stretch">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {filteredTasks.length === 0 && (
                <Text color="gray.500" textAlign="center" py={8}>
                  No tasks found
                </Text>
              )}
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={4} color={textColor}>
              Available Team
            </Heading>
            <VStack spacing={3} align="stretch">
              {employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
              {employees.length === 0 && (
                <Text color="gray.500" textAlign="center" py={8}>
                  No employees available
                </Text>
              )}
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
