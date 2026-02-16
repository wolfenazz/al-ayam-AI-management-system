'use client'

import { memo } from 'react'
import { Box, VStack, HStack, Text, Badge, useColorModeValue } from '@chakra-ui/react'
import { format } from 'date-fns'
import type { TimelineEvent } from '@/lib/services/task-timeline.service'
import { getEventIcon, getEventColor } from '@/lib/services/task-timeline.service'

interface TaskTimelineProps {
  readonly events: readonly TimelineEvent[]
}

export const TaskTimeline = memo<TaskTimelineProps>(({ events }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.900', 'gray.100')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400')

  if (events.length === 0) {
    return (
      <Box
        p={8}
        textAlign="center"
        borderRadius="lg"
        bg={bgColor}
      >
        <Text color={secondaryTextColor}>No events recorded yet</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      {events.map((event, index) => {
        const icon = getEventIcon(event.eventType)
        const color = getEventColor(event.eventType)
        
        return (
          <HStack key={event.id} align="start" spacing={4}>
            <VStack spacing={0} align="center" pt={2}>
              <Box
                w="10"
                h="10"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={`${color}.100`}
                color={`${color}.600`}
                fontSize="lg"
                borderWidth={2}
                borderColor={`${color}.300`}
              >
                {icon}
              </Box>
              {index < events.length - 1 && (
                <Box
                  w="2"
                  flex={1}
                  bg={`${color}.200`}
                  minH="20px"
                />
              )}
            </VStack>

            <Box flex={1} pb={index === events.length - 1 ? 0 : 4}>
              <HStack
                justify="space-between"
                align="start"
                mb={1}
              >
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  color={textColor}
                >
                  {event.description}
                </Text>
                <Badge
                  size="xs"
                  colorScheme={color}
                  variant="subtle"
                >
                  {event.eventType}
                </Badge>
              </HStack>

              <VStack spacing={1} align="start" fontSize="xs" color={secondaryTextColor}>
                <HStack spacing={2}>
                  <Text>by {event.userName}</Text>
                  <Text>•</Text>
                  <Text>
                    {format(new Date(event.createdAt), 'PPp')}
                  </Text>
                  <Text>•</Text>
                  <Text>
                    {format(new Date(event.createdAt), 'dd MMM yyyy')}
                  </Text>
                </HStack>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <Box>
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <HStack key={key} spacing={2}>
                        <Text fontWeight="medium">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Text>
                        <Text>
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </Text>
                      </HStack>
                    ))}
                  </Box>
                )}
              </VStack>
            </Box>
          </HStack>
        )
      })}
    </VStack>
  )
})

TaskTimeline.displayName = 'TaskTimeline'
