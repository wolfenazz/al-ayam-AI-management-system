import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth'
import { auth } from './lib/firebase/config'
import { canAccessRoute } from './lib/auth/rbac'

const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check authentication status
  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

  // Redirect to login if not authenticated
  if (!user || user.isAnonymous) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Get user role from ID token
  let userRole: string | undefined
  try {
    const idTokenResult = await getIdTokenResult(user)
    userRole = idTokenResult.claims?.role as string | undefined
  } catch (error) {
    console.error('Error getting ID token:', error)
  }

  // Check RBAC for protected routes
  if (!canAccessRoute(userRole as any, pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
