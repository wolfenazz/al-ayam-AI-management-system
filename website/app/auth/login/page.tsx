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
  HStack,
  Link,
  Divider,
  useColorModeValue
} from '@chakra-ui/react'
import { useToastNotification } from '@/components/ui'
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToastNotification()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  if (user) {
    router.push('/dashboard')
    return null
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await loginWithEmail(email, password)
      toast.success('Welcome back!', 'You have successfully logged in.')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Login failed', error.message || 'Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)

    try {
      await loginWithGoogle()
      toast.success('Welcome back!', 'You have successfully logged in with Google.')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error('Google login failed', error.message || 'Please try again later.')
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
              Welcome Back
            </Heading>
            <Text color="gray.500">
              Sign in to your account to continue
            </Text>
          </Box>

          <form onSubmit={handleEmailLogin}>
            <VStack spacing={4}>
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

              <Box textAlign="right">
                <Link href="/auth/forgot-password" color="blue.500" fontSize="sm">
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="Signing in..."
                width="full"
              >
                Sign In
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
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
            loadingText="Signing in..."
            width="full"
          >
            Continue with Google
          </Button>

          <Text textAlign="center" color="gray.500">
            Don't have an account?{' '}
            <Link href="/auth/register" color="blue.500">
              Sign up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}
