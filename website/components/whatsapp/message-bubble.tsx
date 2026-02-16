import { Box, Text, useColorModeValue, Flex, Avatar, Badge } from '@chakra-ui/react'
import type { WhatsAppMessage } from '@/lib/types/whatsapp'

interface MessageBubbleProps {
  readonly message: WhatsAppMessage
  readonly isSent: boolean
  readonly senderName?: string
}

export function MessageBubble({
  message,
  isSent,
  senderName
}: MessageBubbleProps) {
  const bg = useColorModeValue(
    isSent ? 'blue.500' : 'gray.100',
    isSent ? 'blue.600' : 'gray.700'
  )
  const color = useColorModeValue(
    isSent ? 'white' : 'gray.900',
    isSent ? 'white' : 'gray.100'
  )
  const secondaryColor = useColorModeValue(
    'gray.500',
    'gray.400'
  )

  const getStatusIndicator = () => {
    if (isSent) {
      if (message.status === 'READ') return '✓✓'
      if (message.status === 'DELIVERED') return '✓✓'
      if (message.status === 'SENT') return '✓'
    }
    return null
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Flex
      justify={isSent ? 'flex-end' : 'flex-start'}
      mb={3}
      align="flex-end"
    >
      {!isSent && (
        <Avatar
          size="sm"
          name={senderName || 'Employee'}
          mr={2}
          mb={1}
        />
      )}
      <Box
        maxW="70%"
        bg={bg}
        color={color}
        p={3}
        borderRadius="lg"
        borderBottomRightRadius={isSent ? 'md' : 'lg'}
        borderBottomLeftRadius={isSent ? 'lg' : 'md'}
      >
        {!isSent && senderName && (
          <Text fontSize="xs" fontWeight="bold" mb={1}>
            {senderName}
          </Text>
        )}

        {message.messageType === 'TEXT' && message.content && (
          <Text whiteSpace="pre-wrap" mb={1}>
            {message.content}
          </Text>
        )}

        {message.messageType === 'IMAGE' && message.mediaUrl && (
          <Box>
            <Box
              as="img"
              src={message.mediaUrl}
              alt="Shared image"
              borderRadius="md"
              maxH="200px"
              w="auto"
              mb={1}
            />
            {message.content && (
              <Text fontSize="sm" whiteSpace="pre-wrap" mb={1}>
                {message.content}
              </Text>
            )}
          </Box>
        )}

        {message.messageType === 'VIDEO' && message.mediaUrl && (
          <Box>
            <Text fontSize="sm" mb={1}>📹 Video attachment</Text>
            {message.content && (
              <Text fontSize="sm" whiteSpace="pre-wrap" mb={1}>
                {message.content}
              </Text>
            )}
          </Box>
        )}

        {message.messageType === 'AUDIO' && message.mediaUrl && (
          <Box>
            <Text fontSize="sm" mb={1}>🎤 Voice note</Text>
          </Box>
        )}

        {message.messageType === 'DOCUMENT' && message.mediaUrl && (
          <Box>
            <Text fontSize="sm" mb={1}>📄 Document attachment</Text>
            {message.content && (
              <Text fontSize="sm" whiteSpace="pre-wrap" mb={1}>
                {message.content}
              </Text>
            )}
          </Box>
        )}

        {message.messageType === 'LOCATION' && message.location && (
          <Box>
            <Text fontSize="sm" mb={1}>
              📍 {message.location.latitude.toFixed(4)},{' '}
              {message.location.longitude.toFixed(4)}
            </Text>
            {message.location.address && (
              <Text fontSize="sm" mb={1}>{message.location.address}</Text>
            )}
          </Box>
        )}

        {message.isSystemMessage && (
          <Badge size="sm" variant="subtle">
            System
          </Badge>
        )}

        <Flex
          justify="flex-end"
          align="center"
          mt={1}
          fontSize="xs"
          color={secondaryColor}
        >
          <Text>{formatTime(message.sentAt)}</Text>
          {getStatusIndicator() && (
            <Text ml={2} color={isSent ? 'white' : secondaryColor}>
              {getStatusIndicator()}
            </Text>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}
