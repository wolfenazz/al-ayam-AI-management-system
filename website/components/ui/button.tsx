'use client'

import { memo, forwardRef, type ButtonHTMLAttributes } from 'react'
import { Button as ChakraButton, useColorModeValue } from '@chakra-ui/react'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  readonly variant?: 'solid' | 'outline' | 'ghost'
  readonly colorScheme?: string
  readonly isLoading?: boolean
  readonly size?: 'sm' | 'md' | 'lg'
}

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const { children, isLoading, ...rest } = props
    const hoverBg = useColorModeValue('gray.100', 'gray.700')

    return (
      <ChakraButton
        ref={ref}
        {...rest}
        isLoading={isLoading}
        bg={props.variant === 'solid' ? 'blue.500' : 'transparent'}
        color={props.variant === 'solid' ? 'white' : 'blue.500'}
        border={props.variant === 'outline' ? '2px solid' : 'none'}
        _hover={{ bg: hoverBg }}
        disabled={isLoading}
      >
        {children}
      </ChakraButton>
    )
  })
)

Button.displayName = 'Button'
