'use client'

import { useState, useEffect } from 'react'
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  VStack,
  Text,
  HStack,
  Button,
  Box,
  Flex,
  useColorModeValue
} from '@chakra-ui/react'
import { BellIcon } from '@chakra-ui/icons'
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/services/notification.service'
import { getUnreadCount } from '@/lib/services/notification.service'
import type { Notification } from '@/lib/types/notification'
import { formatDistanceToNow } from 'date-fns'

export function NotificationCenter({ recipientId }: { readonly recipientId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const loadNotifications = async () => {
    const [loadedNotifications, count] = await Promise.all([
      getNotifications({ recipientId }),
      getUnreadCount(recipientId)
    ])
    setNotifications(loadedNotifications)
    setUnreadCount(count)
  }

  useEffect(() => {
    loadNotifications()
  }, [recipientId])

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, status: 'READ' as const } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(recipientId)
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'READ' as const }))
    )
    setUnreadCount(0)
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    const colors: Record<Notification['priority'], string> = {
      CRITICAL: 'red',
      HIGH: 'orange',
      NORMAL: 'blue',
      LOW: 'gray'
    }
    return colors[priority]
  }

  const getTypeIcon = (type: Notification['type']) => {
    const icons: Record<Notification['type'], string> = {
      TASK_ASSIGNED: '📋',
      TASK_ACCEPTED: '✅',
      TASK_COMPLETED: '🎉',
      DEADLINE_APPROACHING: '⏰',
      OVERDUE: '⚠️',
      ESCALATION: '🚨',
      MEDIA_UPLOADED: '📎',
      SYSTEM: '⚙️'
    }
    return icons[type]
  }

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      closeOnBlur={false}
    >
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              boxSize="5"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="md" bg={bg} borderColor={borderColor}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold">Notifications</Text>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="ghost"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </Flex>
        </PopoverHeader>
        <PopoverBody>
          <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
            {notifications.length === 0 ? (
              <Box py={8} textAlign="center">
                <Text color="gray.500">No notifications</Text>
              </Box>
            ) : (
              notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={3}
                  borderRadius="md"
                  bg={notification.status === 'READ' ? 'transparent' : 'gray.50'}
                  borderLeftWidth="3"
                  borderLeftColor={getPriorityColor(notification.priority)}
                  cursor="pointer"
                  onClick={() => handleMarkAsRead(notification.id)}
                  _hover={{ bg: 'gray.100' }}
                >
                  <HStack mb={2} justify="space-between">
                    <HStack spacing={2}>
                      <Text>{getTypeIcon(notification.type)}</Text>
                      <Text
                        fontWeight="medium"
                        fontSize="sm"
                        color={getPriorityColor(notification.priority) + '.500'}
                      >
                        {notification.priority}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true
                      })}
                    </Text>
                  </HStack>
                  <Text fontWeight="semibold" mb={1} fontSize="sm">
                    {notification.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {notification.message}
                  </Text>
                  {notification.status === 'READ' && (
                    <Badge size="xs" mt={2} variant="subtle">
                      Read
                    </Badge>
                  )}
                </Box>
              ))
            )}
          </VStack>
        </PopoverBody>
        <PopoverFooter>
          <Button size="sm" variant="ghost" w="full">
            View all notifications
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  )
}
