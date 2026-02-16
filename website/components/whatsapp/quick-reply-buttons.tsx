import { Button, HStack, ButtonProps } from '@chakra-ui/react'

interface QuickReplyButtonsProps {
  readonly replies: readonly string[]
  readonly onReply: (reply: string) => void
  readonly isLoading?: boolean
}

export function QuickReplyButtons({
  replies,
  onReply,
  isLoading = false
}: QuickReplyButtonsProps) {
  if (!replies || replies.length === 0) {
    return null
  }

  const getButtonVariant = (reply: string): ButtonProps['variant'] => {
    const lowerReply = reply.toLowerCase()
    if (lowerReply.includes('accept') || lowerReply.includes('yes') || lowerReply.includes('ok')) {
      return 'solid'
    }
    if (lowerReply.includes('decline') || lowerReply.includes('no')) {
      return 'solid'
    }
    return 'outline'
  }

  const getColorScheme = (reply: string): ButtonProps['colorScheme'] => {
    const lowerReply = reply.toLowerCase()
    if (lowerReply.includes('accept') || lowerReply.includes('yes') || lowerReply.includes('ok') || lowerReply.includes('started')) {
      return 'green'
    }
    if (lowerReply.includes('decline') || lowerReply.includes('no')) {
      return 'red'
    }
    if (lowerReply.includes('call')) {
      return 'blue'
    }
    return 'gray'
  }

  return (
    <HStack spacing={3} mt={4} flexWrap="wrap">
      {replies.map((reply, index) => (
        <Button
          key={index}
          variant={getButtonVariant(reply)}
          colorScheme={getColorScheme(reply)}
          size="sm"
          onClick={() => onReply(reply)}
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          {reply}
        </Button>
      ))}
    </HStack>
  )
}
