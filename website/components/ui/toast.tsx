'use client'

import {
  useToast
} from '@chakra-ui/react'

export function useToastNotification() {
  const toast = useToast()

  const success = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    })
  }

  const error = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    })
  }

  const warning = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'warning',
      duration: 4000,
      isClosable: true,
      position: 'top-right'
    })
  }

  const info = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'info',
      duration: 4000,
      isClosable: true,
      position: 'top-right'
    })
  }

  return { success, error, warning, info }
}

export const toast = {
  success: (title: string, description?: string) => {
    // This is a placeholder - should use useToastNotification hook in components
    console.warn('toast.success called outside of React component. Use useToastNotification hook instead.')
  },
  error: (title: string, description?: string) => {
    console.warn('toast.error called outside of React component. Use useToastNotification hook instead.')
  },
  warning: (title: string, description?: string) => {
    console.warn('toast.warning called outside of React component. Use useToastNotification hook instead.')
  },
  info: (title: string, description?: string) => {
    console.warn('toast.info called outside of React component. Use useToastNotification hook instead.')
  }
}

