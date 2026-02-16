'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Spinner,
  ScrollArea
} from '@chakra-ui/react'
import { SendIcon } from '@chakra-ui/icons'
import { MessageBubble } from './message-bubble'
import { QuickReplyButtons } from './quick-reply-buttons'
import { getMessagesForTask } from '@/lib/services/whatsapp.service'
import { sendWhatsAppMessage } from '@/lib/services/whatsapp.service'
import { parseEmployeeResponse } from '@/lib/services/whatsapp.service'
import { updateTaskStatus } from '@/lib/services/task.service'
import type { WhatsAppMessage } from '@/lib/types/whatsapp'
import type { Task } from '@/lib/types/task'
import type { Employee } from '@/lib/types/employee'

interface WhatsAppThreadProps {
  readonly task: Task
  readonly employee: Employee
  readonly onStatusUpdate?: (status: Task['status']) => void
}

export function WhatsAppThread({
  task,
  employee,
  onStatusUpdate
}: WhatsAppThreadProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    loadMessages()
  }, [task.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadMessages() {
    try {
      setIsLoading(true)
      const taskMessages = await getMessagesForTask(task.id)
      setMessages(taskMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function scrollToBottom() {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || isSending) {
      return
    }

    try {
      setIsSending(true)
      await sendWhatsAppMessage({
        taskId: task.id,
        recipientId: employee.id,
        recipientPhone: employee.whatsappUid,
        message: newMessage.trim()
      })

      setNewMessage('')
      await loadMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  async function handleQuickReply(reply: string) {
    if (isSending) return

    const parsed = parseEmployeeResponse(reply)

    let updatedStatus: Task['status'] | null = null

    switch (parsed.action) {
      case 'ACCEPT':
        if (task.status === 'DRAFT' || task.status === 'SENT') {
          updatedStatus = 'ACCEPTED'
        }
        break
      case 'DECLINE':
        updatedStatus = 'DECLINED'
        break
      case 'PROGRESS':
        if (
          task.status === 'ACCEPTED' ||
          task.status === 'SENT' ||
          task.status === 'DRAFT'
        ) {
          updatedStatus = 'IN_PROGRESS'
        }
        break
      case 'COMPLETE':
        updatedStatus = 'COMPLETED'
        break
      case 'DELAY':
        break
    }

    try {
      setIsSending(true)

      if (updatedStatus) {
        await updateTaskStatus(task.id, updatedStatus)
        onStatusUpdate?.(updatedStatus)
      }

      await sendWhatsAppMessage({
        taskId: task.id,
        recipientId: employee.id,
        recipientPhone: employee.whatsappUid,
        message: reply
      })

      await loadMessages()
    } catch (error) {
      console.error('Failed to send quick reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const isTaskInInitialStatus =
    task.status === 'DRAFT' || task.status === 'SENT' || task.status === 'ACCEPTED'

  const quickReplies = isTaskInInitialStatus
    ? ['👍 ACCEPT', '❌ DECLINE', '📞 CALL']
    : task.status === 'IN_PROGRESS'
      ? ['DONE', 'Almost done', 'Running late']
      : []

  return (
    <Box
      bg={bgColor}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      h="500px"
    >
      <Flex
        p={4}
        borderBottomWidth={1}
        borderColor={borderColor}
        align="center"
        justify="space-between"
      >
        <Box>
          <Text fontWeight="bold" fontSize="md">
            WhatsApp Conversation
          </Text>
          <Text fontSize="xs" color="gray.500">
            {employee.name} • Task #{task.id.slice(-6)}
          </Text>
        </Box>
      </Flex>

      <Box
        ref={scrollAreaRef}
        flex={1}
        overflowY="auto"
        p={4}
        h="calc(500px - 140px)"
      >
        {isLoading ? (
          <Flex justify="center" align="center" h="full">
            <Spinner size="lg" />
          </Flex>
        ) : messages.length === 0 ? (
          <Flex justify="center" align="center" h="full">
            <Text color="gray.500">No messages yet</Text>
          </Flex>
        ) : (
          <VStack spacing={0} align="stretch">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSent={message.direction === 'OUTBOUND'}
                senderName={
                  message.direction === 'INBOUND' ? employee.name : 'You'
                }
              />
            ))}
          </VStack>
        )}
      </Box>

      {quickReplies.length > 0 && (
        <Box p={3} borderTopWidth={1} borderColor={borderColor}>
          <QuickReplyButtons
            replies={quickReplies}
            onReply={handleQuickReply}
            isLoading={isSending}
          />
        </Box>
      )}

      <HStack p={4} borderTopWidth={1} borderColor={borderColor} spacing={3}>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          isDisabled={isSending}
        />
        <Button
          colorScheme="blue"
          onClick={handleSendMessage}
          isDisabled={!newMessage.trim() || isSending}
          isLoading={isSending}
        >
          <SendIcon />
        </Button>
      </HStack>
    </Box>
  )
}
