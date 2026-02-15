'use client'

import { memo } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Box, useColorModeValue } from '@chakra-ui/react'
import { FiChevronRight } from 'react-icons/fi'

interface BreadcrumbItem {
  readonly label: string
  readonly path?: string
  readonly onClick?: () => void
}

interface BreadcrumbsProps {
  readonly items: readonly BreadcrumbItem[]
}

export const Breadcrumbs = memo<BreadcrumbsProps>(({ items }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const separator = <FiChevronRight size={3} color={textColor} />

  return (
    <Breadcrumb
      separator={separator}
      fontSize="sm"
      spacing={2}
      mb={6}
    >
      {items.map((item, index) => (
        <BreadcrumbItem key={index}>
          {item.path ? (
            <BreadcrumbLink href={item.path} color={textColor}>
              {item.label}
            </BreadcrumbLink>
          ) : item.onClick ? (
            <Box
              as="span"
              color={textColor}
              cursor="pointer"
              onClick={item.onClick}
              _hover={{ color: 'blue.500' }}
            >
              {item.label}
            </Box>
          ) : (
            <span color={textColor}>{item.label}</span>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
})

Breadcrumbs.displayName = 'Breadcrumbs'
