'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Input,
  Select,
  SimpleGrid,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react'
import { AddIcon, SearchIcon } from '@chakra-ui/icons'
import { TaskTemplateCard } from '@/components/tasks/task-template-card'
import { useTaskTemplates } from '@/lib/hooks/use-task-templates'
import type { TaskType } from '@/lib/types/task'
import { TASK_TYPE } from '@/lib/constants/task-status'

export default function TaskTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<TaskType | 'ALL'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const { templates, isLoading } = useTaskTemplates()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.900', 'gray.100')

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'ALL' || template.type === filterType

    return matchesSearch && matchesType
  })

  return (
    <Box bg={bgColor} minH="screen" p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color={textColor}>
            Task Templates
          </Heading>
          <Text color="gray.500">
            Pre-defined task templates for quick assignment
          </Text>
        </Box>

        <HStack spacing={4}>
          <Box flex={1} position="relative">
            <SearchIcon
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
            />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pl={10}
            />
          </Box>

          <Select
            placeholder="All Types"
            maxW="200px"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TaskType | 'ALL')}
          >
            <option value="ALL">All Types</option>
            {Object.entries(TASK_TYPE).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Template
          </Button>
        </HStack>

        {isLoading ? (
          <Box py={20} textAlign="center">
            <Spinner size="xl" />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Box
            py={20}
            textAlign="center"
            bg={cardBg}
            borderRadius="lg"
            borderWidth={1}
            borderColor="gray.200"
          >
            <Text color="gray.500" fontSize="lg">
              No templates found
            </Text>
            <Text color="gray.400" mt={2}>
              {searchQuery || filterType !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Create your first template to get started'}
            </Text>
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
          >
            {filteredTemplates.map((template) => (
              <TaskTemplateCard
                key={template.id}
                template={template}
                onEdit={(id) => console.log('Edit template:', id)}
                onDuplicate={(id) => console.log('Duplicate template:', id)}
                onDelete={(id) => console.log('Delete template:', id)}
                onUse={(id) => console.log('Use template:', id)}
              />
            ))}
          </SimpleGrid>
        )}

        {showCreateModal && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.5)"
            onClick={() => setShowCreateModal(false)}
            zIndex={1000}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              bg={cardBg}
              p={8}
              maxW="600px"
              mx="auto"
              mt={100}
              borderRadius="lg"
            >
              <Heading size="md" mb={4} color={textColor}>
                Create New Template
              </Heading>
              <Text color="gray.500" mb={6}>
                Template creation form will be implemented here
              </Text>
              <Button onClick={() => setShowCreateModal(false)}>
                Close
              </Button>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
