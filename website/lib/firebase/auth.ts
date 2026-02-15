import { cache } from 'react'
import type { User } from 'firebase/auth'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth } from './config'

const googleProvider = new GoogleAuthProvider()

export const getUser = cache(async (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
})

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function registerWithEmailAndPassword(
  email: string,
  password: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}
