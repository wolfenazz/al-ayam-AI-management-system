'use client'

import { memo } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'

interface CardProps {
  readonly children: React.ReactNode
  readonly onClick?: () => void
  readonly isHoverable?: boolean
  readonly p?: number
  readonly bg?: string
  readonly borderWidth?: number
}

export const Card = memo<CardProps>(({ children, onClick, isHoverable = false, p = 4, bg, borderWidth = 1 }) => {
  const defaultBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Box
      p={p}
      borderWidth={borderWidth}
      borderColor={borderColor}
      borderRadius="md"
      bg={bg ?? defaultBg}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={isHoverable ? { bg: hoverBg } : undefined}
      transition="background 0.2s, border-color 0.2s"
      shadow="sm"
    >
      {children}
    </Box>
  )
})

Card.displayName = 'Card'
