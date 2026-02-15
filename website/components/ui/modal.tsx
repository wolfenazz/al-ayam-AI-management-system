'use client'

import { memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Heading,
  useColorModeValue
} from '@chakra-ui/react'

interface ModalProps {
  readonly title: string
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly footer?: React.ReactNode
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  readonly children: React.ReactNode
}

export const Dialog = memo<ModalProps>(({ title, isOpen, onClose, footer, size, children }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <ModalCloseButton />
          <Heading size="md">{title}</Heading>
        </ModalHeader>
        <ModalBody pb={6} color={textColor}>
          {children}
        </ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  )
})

Dialog.displayName = 'Dialog'
