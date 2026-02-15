'use client'

import { memo, useState, useMemo } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  IconButton,
  Collapse,
  Icon,
  useDisclosure
} from '@chakra-ui/react'
import { FiHome, FiGrid, FiUsers, FiBell, FiSettings, FiMenu, FiChevronLeft } from 'react-icons/fi'
import { ROUTES } from '@/lib/constants/routes'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'

interface SidebarProps {
  readonly onNavigate?: (path: string) => void
  readonly unreadCount?: number
}

export const Sidebar = memo<SidebarProps>(({ onNavigate, unreadCount = 0 }) => {
  const { isOpen, onToggle } = useDisclosure()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  const menuItems = useMemo(
    () => [
      {
        icon: FiHome,
        label: 'Dashboard',
        path: ROUTES.DASHBOARD.HOME
      },
      {
        icon: FiGrid,
        label: 'Tasks',
        path: ROUTES.DASHBOARD.TASKS.LIST
      },
      {
        icon: FiUsers,
        label: 'Employees',
        path: ROUTES.DASHBOARD.EMPLOYEES.LIST
      },
      {
        icon: FiGrid,
        label: 'News',
        path: ROUTES.DASHBOARD.NEWS.LIST
      },
      {
        icon: FiBell,
        label: 'Notifications',
        path: ROUTES.DASHBOARD.SETTINGS.NOTIFICATIONS,
        badge: unreadCount > 0
      },
      {
        icon: FiSettings,
        label: 'Settings',
        path: ROUTES.DASHBOARD.SETTINGS.OVERVIEW
      }
    ],
    [unreadCount]
  )

  return (
    <Box
      as="aside"
      bg={bgColor}
      borderRightWidth={1}
      borderRightColor="gray.200"
      h="calc(100vh - 64px)"
      position="fixed"
      left={0}
      top={0}
      w={{ base: isOpen ? 'full' : '250px', lg: '250px' }}
      zIndex={20}
      transition="width 0.3s"
    >
      <Flex direction="column" h="full">
        <Box p={6} borderBottomWidth={1} borderBottomColor="gray.200">
          <Heading size="sm" color={textColor}>
            Menu
          </Heading>
        </Box>

        <Box flex={1} overflowY="auto">
          {menuItems.map((item) => (
            <Box
              key={item.path}
              onClick={() => onNavigate?.(item.path)}
              p={4}
              mx={4}
              my={2}
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: 'gray.200' }}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Flex align="center" gap={3}>
                <Icon as={item.icon} color={textColor} boxSize={5} />
                <Text color={textColor}>{item.label}</Text>
              </Flex>
              {item.badge && <Badge colorScheme="blue">{unreadCount}</Badge>}
            </Box>
          ))}
        </Box>
      </Flex>
    </Box>
  )
})

Sidebar.displayName = 'Sidebar'
