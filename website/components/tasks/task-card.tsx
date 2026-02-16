'use client'

import { memo, useState } from 'react'
import {
  Box,
  Text,
  Badge,
  HStack,
  Button,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  Spinner
} from '@chakra-ui/react'
import { ChatIcon, ViewIcon } from '@chakra-ui/icons'
import type { Task } from '../../lib/types/task'
import { TASK_STATUS, PRIORITY_COLORS, STATUS_COLORS } from '../../lib/constants/task-status'
import { DeadlineCounter } from './deadline-counter'
import { TaskStatusBadge } from './task-status-badge'
import { PriorityBadge } from './priority-badge'

interface TaskCardProps {
  readonly task: Task
  readonly onClick?: () => void
  readonly onStatusChange?: (taskId: string, status: Task['status']) => void
  readonly onDispatch?: (task: Task) => void
  readonly employee?: {
    readonly id: string
    readonly name: string
    readonly whatsappUid: string
  } | null
}

export const TaskCard = memo<TaskCardProps>(
  ({ task, onClick, onStatusChange, onDispatch, employee }) => {
    const [isDispatching, setIsDispatching] = useState(false)
    const {
      isOpen: isDispatchModalOpen,
      onOpen: onDispatchModalOpen,
      onClose: onDispatchModalClose
    } = useDisclosure()

    const isOverdue =
      task.deadline &&
      new Date(task.deadline) < new Date() &&
      task.status !== 'COMPLETED'

    const canDispatch =
      task.status === 'DRAFT' || task.status === 'SENT' || task.status === 'DECLINED'

    const handleDispatch = async () => {
      if (!onDispatch || !employee || isDispatching) return

      setIsDispatching(true)
      try {
        await onDispatch(task)
        onDispatchModalClose()
      } catch (error) {
        console.error('Failed to dispatch task:', error)
      } finally {
        setIsDispatching(false)
      }
    }

    const handleDispatchClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (canDispatch && employee) {
        onDispatchModalOpen()
      }
    }

    const handleViewClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onClick?.()
    }

    return (
      <>
        <Box
          p={4}
          borderWidth={1}
          borderRadius="md"
          bg="white"
          _hover={{ bg: 'gray.50' }}
          cursor="pointer"
          onClick={handleViewClick}
          transition="background 0.2s"
        >
          <HStack justify="space-between" mb={2}>
            <HStack spacing={2}>
              <PriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />
            </HStack>
            {canDispatch && employee && (
              <IconButton
                aria-label="Dispatch via WhatsApp"
                icon={<ChatIcon />}
                size="sm"
                colorScheme="green"
                onClick={handleDispatchClick}
              />
            )}
          </HStack>

          <Text fontWeight="semibold" mb={1} noOfLines={2}>
            {task.title}
          </Text>

          <Text color="gray.600" fontSize="sm" noOfLines={2} mb={3}>
            {task.description}
          </Text>

          {employee && (
            <HStack mb={3}>
              <Text fontSize="xs" color="gray.500">
                Assigned to: {employee.name}
              </Text>
              {task.status === 'SENT' && (
                <Badge colorScheme="blue" fontSize="xs">
                  Sent via WhatsApp
                </Badge>
              )}
            </HStack>
          )}

          {task.deadline && (
            <Box>
              <DeadlineCounter deadline={task.deadline} status={task.status} />
            </Box>
          )}
        </Box>

        <Modal
          isOpen={isDispatchModalOpen}
          onClose={onDispatchModalClose}
          size="md"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Dispatch Task via WhatsApp</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    {task.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {task.description}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Recipient:
                  </Text>
                  <HStack>
                    <Box
                      w="10"
                      h="10"
                      borderRadius="full"
                      bg="green.500"
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                    >
                      {employee?.name.charAt(0)}
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{employee?.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {employee?.whatsappUid}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Message Preview:
                  </Text>
                  <Box
                    bg="gray.100"
                    p={3}
                    borderRadius="md"
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                    maxH="150px"
                    overflowY="auto"
                  >
                    {task.priority === 'URGENT' && '🚨 '}
                    {task.type === 'BREAKING_NEWS' && 'BREAKING NEWS ASSIGNMENT\n\n'}
                    Hi {employee?.name},\n\n
                    {task.title}\n\n
                    {task.description}
                    {task.deadline && `\n⏰ Deadline: ${task.deadline.toLocaleDateString()}`}
                    {'\n\nTask ID: #' + task.id.slice(-6)}
                  </Box>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onDispatchModalClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleDispatch}
                isLoading={isDispatching}
                leftIcon={<ChatIcon />}
              >
                Send via WhatsApp
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
)

TaskCard.displayName = 'TaskCard'
