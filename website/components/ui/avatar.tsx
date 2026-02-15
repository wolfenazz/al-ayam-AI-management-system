'use client'

import { memo, useMemo, useCallback } from 'react'
import { Avatar as ChakraAvatar, Box, useColorModeValue } from '@chakra-ui/react'

interface AvatarProps {
  readonly name: string
  readonly src?: string
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  readonly showStatus?: boolean
  readonly status?: 'available' | 'busy' | 'offline'
}

export const Avatar = memo<AvatarProps>(({ name, src, size = 'md', showStatus, status }) => {
  const textColor = useColorModeValue('gray.800', 'gray.100')
  
  const statusColor = useMemo(() => {
    switch (status) {
      case 'available':
        return 'green.500'
      case 'busy':
        return 'yellow.500'
      case 'offline':
        return 'gray.400'
      default:
        return 'gray.400'
    }
  }, [status])

  return (
    <ChakraAvatar
      name={name}
      src={src}
      size={size}
      bg="gray.100"
      color="gray.600"
      position="relative"
    >
      {showStatus && (
        <Box
          position="absolute"
          bottom={0}
          right={0}
          w={3}
          h={3}
          borderRadius="full"
          bg={statusColor}
          border="2px solid"
        />
      )}
    </ChakraAvatar>
  )
})

Avatar.displayName = 'Avatar'
