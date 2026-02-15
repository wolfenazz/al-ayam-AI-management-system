'use client'

import { memo, useState } from 'react'
import { 
  HStack, 
  Badge, 
  Text, 
  Button, 
  Tooltip, 
  useColorModeValue,
  Box
} from '@chakra-ui/react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface SkillTagsProps {
  readonly skills: readonly string[]
  readonly maxVisible?: number
  readonly size?: 'sm' | 'md'
  readonly variant?: 'solid' | 'subtle' | 'outline'
  readonly colorScheme?: string
  readonly editable?: boolean
  readonly onRemove?: (skill: string) => void
}

export const SkillTags = memo<SkillTagsProps>(({ 
  skills,
  maxVisible = 5,
  size = 'sm',
  variant = 'subtle',
  colorScheme = 'blue',
  editable = false,
  onRemove
}) => {
  const [showAll, setShowAll] = useState(false)
  const textColor = useColorModeValue('gray.800', 'gray.100')

  const visibleSkills = showAll ? skills : skills.slice(0, maxVisible)
  const hasMore = skills.length > maxVisible

  const handleRemove = (skill: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.(skill)
  }

  if (skills.length === 0) {
    return (
      <Text color="gray.500" fontSize="sm">
        No skills
      </Text>
    )
  }

  return (
    <HStack spacing={2} flexWrap="wrap">
      {visibleSkills.map(skill => (
        <Tooltip key={skill} label={skill} hasArrow placement="top">
          <Badge
            size={size}
            variant={variant}
            colorScheme={colorScheme}
            display="inline-flex"
            alignItems="center"
          >
            {skill}
            {editable && onRemove && (
              <Button
                size="xs"
                ml={1}
                variant="ghost"
                colorScheme="red"
                onClick={(e) => handleRemove(skill, e)}
                p={0}
                minW="auto"
                h="auto"
                _hover={{ bg: 'transparent' }}
              >
                ×
              </Button>
            )}
          </Badge>
        </Tooltip>
      ))}

      {hasMore && !showAll && (
        <Button
          size={size === 'sm' ? 'xs' : 'sm'}
          variant="ghost"
          onClick={() => setShowAll(true)}
          rightIcon={<FiChevronDown />}
        >
          +{skills.length - maxVisible} more
        </Button>
      )}

      {showAll && (
        <Button
          size={size === 'sm' ? 'xs' : 'sm'}
          variant="ghost"
          onClick={() => setShowAll(false)}
          rightIcon={<FiChevronUp />}
        >
          Show less
        </Button>
      )}
    </HStack>
  )
})

SkillTags.displayName = 'SkillTags'
