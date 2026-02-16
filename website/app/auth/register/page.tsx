'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Link,
  Divider,
  useColorModeValue
} from '@chakra-ui/react'
import { useToastNotification } from '@/components/ui'
import { registerWithEmailAndPassword, loginWithGoogle } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/hooks/use-auth'

export default function RegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToastNotification()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const validateForm = (): boolean => {
    if (!name || name.trim().length < 2) {
      toast.error('Invalid name', 'Name must be at least 2 characters.')
      return false
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email', 'Please enter a valid email address.')
      return false
    }

    if (!password || password.length < 6) {
      toast.error('Invalid password', 'Password must be at least 6 characters.')
      return false
    }

    if (password !== confirmPassword) {
      toast.error('Password mismatch', 'Passwords do not match.')
      return false
    }

    return true
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await registerWithEmailAndPassword(email, password)
      toast.success('Account created!', 'Welcome to Al-Ayyam AI Platform.')
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('Registration error:', error)
      const errorCode = (error as { code?: string })?.code
      const errorMessage = error instanceof Error ? error.message : 'Please try again later.'
      
      if (errorCode === 'auth/email-already-in-use') {
        toast.error('Email already in use', 'Please use a different email or sign in.')
      } else if (errorCode === 'auth/weak-password') {
        toast.error('Weak password', 'Please choose a stronger password.')
      } else {
        toast.error('Registration failed', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true)

    try {
      await loginWithGoogle()
      toast.success('Account created!', 'Welcome to Al-Ayyam AI Platform.')
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('Google registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again later.'
      toast.error('Google sign-up failed', errorMessage)
    } finally {
      setIsGoogleLoading(false)
    }
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
              Create Account
            </Heading>
            <Text color="gray.500">
              Join the Al-Ayyam AI Platform today
            </Text>
          </Box>

          <form onSubmit={handleEmailRegister}>
            <VStack spacing={4}>
              <Box>
                <Text mb={2} fontWeight="medium" color={textColor}>
                  Full Name
                </Text>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium" color={textColor}>
                  Email
                </Text>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium" color={textColor}>
                  Password
                </Text>
                <Input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium" color={textColor}>
                  Confirm Password
                </Text>
                <Input
                  type="password"
                  placeholder="••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="Creating account..."
                width="full"
              >
                Create Account
              </Button>
            </VStack>
          </form>

          <HStack>
            <Divider />
            <Text color="gray.500" fontSize="sm">
              OR
            </Text>
            <Divider />
          </HStack>

          <Button
            variant="outline"
            size="lg"
            onClick={handleGoogleRegister}
            isLoading={isGoogleLoading}
            loadingText="Creating account..."
            width="full"
          >
            Continue with Google
          </Button>

          <Text textAlign="center" color="gray.500">
            Already have an account?{' '}
            <Link href="/auth/login" color="blue.500">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}
