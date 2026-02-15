'use client'

import { memo } from 'react'
import { Badge as ChakraBadge, useColorModeValue } from '@chakra-ui/react'

interface BadgeProps {
  readonly children: React.ReactNode
  readonly colorScheme?: string
  readonly variant?: 'solid' | 'subtle' | 'outline'
  readonly size?: 'sm' | 'md' | 'lg'
}

export const Badge = memo<BadgeProps>(({ children, colorScheme = 'blue', variant = 'solid', size = 'sm' }) => {
  const textColor = useColorModeValue('gray.800', 'gray.100')

  return (
    <ChakraBadge
      colorScheme={colorScheme}
      variant={variant}
      size={size}
      color={variant === 'subtle' ? textColor : undefined}
    >
      {children}
    </ChakraBadge>
  )
})

Badge.displayName = 'Badge'
