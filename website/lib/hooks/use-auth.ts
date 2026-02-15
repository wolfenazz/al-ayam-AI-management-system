'use client'

import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChange, logout } from '../firebase/auth'
import type { User } from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    setUser(null)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout
  }
}

export function useAuthGuard() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/auth/login'
    }
  }, [user, isLoading])

  return { user, isLoading }
}
