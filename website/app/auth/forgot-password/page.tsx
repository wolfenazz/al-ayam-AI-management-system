'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  Link,
  useColorModeValue
} from '@chakra-ui/react'
import { useToastNotification } from '@/components/ui'
import { resetPassword } from '@/lib/firebase/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const toast = useToastNotification()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email', 'Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(email)
      setIsSubmitted(true)
      toast.success(
        'Password reset sent!',
        'Check your email for instructions to reset your password.'
      )
    } catch (error: any) {
      console.error('Password reset error:', error)
      if (error.code === 'auth/user-not-found') {
        toast.error('User not found', 'No account found with this email address.')
      } else {
        toast.error('Password reset failed', error.message || 'Please try again later.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          maxW="md"
          w="full"
          bg={cardBg}
          p={8}
          borderRadius="xl"
          shadow="lg"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Box>
              <Heading size="2xl" color={textColor} mb={4}>
                Check Your Email
              </Heading>
              <Text color="gray.500" fontSize="lg">
                We've sent a password reset link to
              </Text>
              <Text fontWeight="medium" color="blue.500" fontSize="lg">
                {email}
              </Text>
              <Text color="gray.500" mt={2}>
                Click the link in the email to reset your password.
              </Text>
            </Box>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => router.push('/auth/login')}
              width="full"
            >
              Back to Login
            </Button>

            <Text color="gray.500">
              Didn't receive the email?{' '}
              <Button
                variant="link"
                colorScheme="blue"
                onClick={() => {
                  setIsSubmitted(false)
                  toast.success('Email resent!', 'Another password reset email has been sent.')
                }}
              >
                Resend
              </Button>
            </Text>
          </VStack>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        maxW="md"
        w="full"
        bg={cardBg}
        p={8}
        borderRadius="xl"
        shadow="lg"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="2xl" color={textColor} mb={2}>
              Forgot Password?
            </Heading>
            <Text color="gray.500">
              No worries! Enter your email and we'll send you a reset link.
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Box>
                <Text mb={2} fontWeight="medium" color={textColor}>
                  Email Address
                </Text>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="Sending..."
                width="full"
              >
                Send Reset Link
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" color="gray.500">
            Remember your password?{' '}
            <Link href="/auth/login" color="blue.500">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}
