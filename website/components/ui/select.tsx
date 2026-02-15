'use client'

import { memo } from 'react'
import {
  Select as ChakraSelect,
  FormLabel,
  FormControl,
  FormErrorMessage,
  useColorModeValue
} from '@chakra-ui/react'

interface SelectOption {
  readonly value: string
  readonly label: string
}

interface SelectProps {
  readonly label?: string
  readonly options: readonly SelectOption[]
  readonly placeholder?: string
  readonly value?: string
  readonly onChange: (value: string) => void
  readonly error?: string
  readonly isRequired?: boolean
}

export const Select = memo<SelectProps>(({ label, options, placeholder, value, onChange, error, isRequired }) => {
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
      <ChakraSelect
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        bg={bgColor}
        borderColor={borderColor}
        color={textColor}
        focusBorderColor="blue.500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </ChakraSelect>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
})

Select.displayName = 'Select'
