'use client'

import { memo } from 'react'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'

interface FooterProps {
  readonly version?: string
}

export const Footer = memo<FooterProps>(({ version = '1.0.0' }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTopWidth={1}
      borderTopColor="gray.200"
      py={6}
      px={8}
      mt="auto"
    >
      <Text textAlign="center" fontSize="sm" color={textColor}>
        © {new Date().getFullYear()} Al-Ayyam AI Platform. All rights reserved.
      </Text>
      <Text textAlign="center" fontSize="xs" color={textColor} mt={2}>
        Version {version}
      </Text>
    </Box>
  )
})

Footer.displayName = 'Footer'
