'use client'

import { memo, forwardRef, type InputHTMLAttributes } from 'react'
import {
  Input as ChakraInput,
  FormLabel,
  FormControl,
  FormErrorMessage,
  useColorModeValue
} from '@chakra-ui/react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly label?: string
  readonly error?: string
  readonly isRequired?: boolean
}

export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { label, error, isRequired, ...rest } = props
    const bgColor = useColorModeValue('white', 'gray.800')
    const borderColor = useColorModeValue('gray.200', 'gray.600')
    const textColor = useColorModeValue('gray.800', 'gray.100')

    return (
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        {label && (
          <FormLabel fontWeight="semibold" mb={2} color={textColor}>
            {label}
            {isRequired && <span color="red.500">*</span>}
          </FormLabel>
        )}
        <ChakraInput
          ref={ref}
          {...rest}
          bg={bgColor}
          borderColor={borderColor}
          color={textColor}
          focusBorderColor="blue.500"
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    )
  })
)

Input.displayName = 'Input'
