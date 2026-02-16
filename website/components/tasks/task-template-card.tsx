'use client'

import { memo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  IconButton,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react'
import {
  EditIcon,
  CopyIcon,
  DeleteIcon,
  TimeIcon
} from '@chakra-ui/icons'
import type { TaskTemplate } from '@/lib/services/task-template.service'
import { TASK_TYPE_LABELS, PRIORITY_COLORS } from '@/lib/constants/task-status'
import { formatDistanceToNow } from 'date-fns'

interface TaskTemplateCardProps {
  readonly template: TaskTemplate
  readonly onEdit: (templateId: string) => void
  readonly onDuplicate: (templateId: string) => void
  readonly onDelete: (templateId: string) => void
  readonly onUse: (templateId: string) => void
}

export const TaskTemplateCard = memo<TaskTemplateCardProps>(({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onUse
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.900', 'gray.100')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400')

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate(template.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(template.id)
  }

  const handleUse = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUse(template.id)
  }

  return (
    <Box
      p={5}
      borderWidth={2}
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      cursor="pointer"
      _hover={{
        borderColor: 'blue.300',
        shadow: 'md',
        transform: 'translateY(-2px)'
      }}
      transition="all 0.2s"
      onClick={() => onUse(template.id)}
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between" align="start">
          <VStack spacing={2} align="start" flex={1}>
            <HStack spacing={2} flexWrap="wrap">
              <Badge
                bg={PRIORITY_COLORS[template.defaultPriority]}
                color="white"
                fontSize="xs"
              >
                {template.defaultPriority}
              </Badge>
              <Badge
                colorScheme="blue"
                variant="outline"
                fontSize="xs"
              >
                {TASK_TYPE_LABELS[template.type]}
              </Badge>
            </HStack>
            <Text
              fontWeight="bold"
              fontSize="lg"
              color={textColor}
              noOfLines={2}
            >
              {template.name}
            </Text>
            {template.description && (
              <Text
                fontSize="sm"
                color={secondaryTextColor}
                noOfLines={2}
              >
                {template.description}
              </Text>
            )}
          </VStack>
          
          <VStack spacing={1}>
            <Tooltip label="Duplicate Template" placement="top">
              <IconButton
                aria-label="Duplicate template"
                icon={<CopyIcon />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={handleDuplicate}
              />
            </Tooltip>
            <Tooltip label="Edit Template" placement="top">
              <IconButton
                aria-label="Edit template"
                icon={<EditIcon />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(template.id)
                }}
              />
            </Tooltip>
            <Tooltip label="Delete Template" placement="top">
              <IconButton
                aria-label="Delete template"
                icon={<DeleteIcon />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleDelete}
              />
            </Tooltip>
          </VStack>
        </HStack>

        <HStack spacing={4} fontSize="sm" color={secondaryTextColor}>
          {template.estimatedDuration && (
            <HStack spacing={1}>
              <TimeIcon boxSize={4} />
              <Text>{template.estimatedDuration} min</Text>
            </HStack>
          )}
          {template.defaultBudget && (
            <HStack spacing={1}>
              <Text>💰</Text>
              <Text>BD {template.defaultBudget}</Text>
            </HStack>
          )}
          <HStack spacing={1}>
            <Text>📊</Text>
            <Text>{template.usageCount} uses</Text>
          </HStack>
        </HStack>

        {template.requiredDeliverables && (
          <Box>
            <Text
              fontSize="xs"
              color={secondaryTextColor}
              mb={2}
              fontWeight="medium"
            >
              Deliverables:
            </Text>
            <HStack spacing={3} fontSize="sm" color={textColor} flexWrap="wrap">
              {template.requiredDeliverables.photos && (
                <HStack spacing={1}>
                  <Text>📷</Text>
                  <Text>{template.requiredDeliverables.photos} photos</Text>
                </HStack>
              )}
              {template.requiredDeliverables.videos && (
                <HStack spacing={1}>
                  <Text>🎥</Text>
                  <Text>{template.requiredDeliverables.videos} videos</Text>
                </HStack>
              )}
              {template.requiredDeliverables.quotes && (
                <HStack spacing={1}>
                  <Text>💬</Text>
                  <Text>{template.requiredDeliverables.quotes} quotes</Text>
                </HStack>
              )}
              {template.requiredDeliverables.articles && (
                <HStack spacing={1}>
                  <Text>📰</Text>
                  <Text>{template.requiredDeliverables.articles} articles</Text>
                </HStack>
              )}
            </HStack>
          </Box>
        )}

        <HStack justify="space-between" align="center">
          <Text fontSize="xs" color={secondaryTextColor}>
            Created {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
          </Text>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={handleUse}
            leftIcon={<CopyIcon />}
          >
            Use Template
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
})

TaskTemplateCard.displayName = 'TaskTemplateCard'
