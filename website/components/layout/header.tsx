'use client'

import { memo } from 'react'
import { Box, HStack, Heading, useColorModeValue } from '@chakra-ui/react'

interface HeaderProps {
  readonly title?: string
  readonly children?: React.ReactNode
}

export const Header = memo<HeaderProps>(({ title = 'Al-Ayyam AI Platform', children }) => {
  const bgColor = useColorModeValue('white', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottomWidth={1}
      borderBottomColor="gray.200"
      py={4}
      px={8}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <HStack maxW="7xl" mx="auto" justify="space-between" align="center">
        <Heading size="md" color={textColor}>
          {title}
        </Heading>
        {children}
      </HStack>
    </Box>
  )
})

Header.displayName = 'Header'
