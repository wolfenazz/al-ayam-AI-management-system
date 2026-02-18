# AGENTS.md - Al-Ayyam AI Management System

Guidelines for AI coding agents working in this Next.js codebase.

## Project Overview

This is a newsroom task management platform built with Next.js 16, Firebase, and Tailwind CSS. It features real-time task management, WhatsApp integration, and role-based access control.

---

## Build, Lint & Test Commands

```bash
# Development
npm run dev                  # Start dev server on localhost:3000

# Production
npm run build                # Build for production
npm run start                # Start production server

# Linting
npm run lint                 # Run ESLint on all files
npx eslint app/dashboard/page.tsx   # Lint a single file
npx eslint --fix app/dashboard/page.tsx  # Lint and auto-fix

# Type Checking (no explicit script - run directly)
npx tsc --noEmit             # Type check without emitting files

# Note: No test framework is currently configured in this project
```

---

## Project Structure

```
website/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-related pages (login, register)
│   ├── dashboard/         # Admin/Manager dashboard
│   │   └── tasks/         # Task management with [id] dynamic routes
│   └── employees-dashboard/  # Employee-facing dashboard
├── components/
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (Sidebar, Header)
│   └── shared/            # Shared feature components
├── hooks/                  # Custom React hooks (useTasks, useAuth, etc.)
├── lib/
│   ├── firebase/          # Firebase config, auth, firestore, storage
│   ├── auth/              # AuthContext and authentication logic
│   └── utils.ts           # Utility functions (cn for classnames)
├── stores/                 # Zustand stores (uiStore)
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

---

## Code Style Guidelines

### Imports

```typescript
// Order: React/Next → External libraries → Internal aliases → Relative imports
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where } from 'firebase/firestore';
import { useAuth } from '@/lib/auth/AuthContext';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

- Use `@/*` path alias for all internal imports
- Group imports by source (React/Next, external, internal, relative)
- `'use client'` directive must be the first line in client components

### TypeScript

- **Strict mode is enabled** - all code must pass strict type checking
- Use explicit return types for functions when type inference is unclear
- Prefer `interface` over `type` for object shapes
- Use union types for finite sets of string values (enums)

```typescript
// Type definitions pattern
export type TaskStatus = 'DRAFT' | 'SENT' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    created_at: string;  // ISO date strings, not Date objects
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `TaskCard`, `CreateTaskModal` |
| Hooks | camelCase with `use` prefix | `useTasks`, `useTaskStats` |
| Types/Interfaces | PascalCase | `Task`, `TaskFilters` |
| Firestore fields | snake_case | `created_at`, `assignee_id` |
| CSS classes | kebab-case (Tailwind) | `text-text-primary` |
| Constants | SCREAMING_SNAKE_CASE | `COLLECTIONS.TASKS` |
| Functions | camelCase | `buildConstraints`, `handleEmployeeUpdate` |

### Components

```typescript
// Use forwardRef for UI components that need ref forwarding
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    }
);
Button.displayName = 'Button';

// Define props interface extending HTML element attributes
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
```

### Section Comments

Use this format to organize code sections:

```typescript
// ─── Section Name ─────────────────────────────────────────────────

// ─── Query Keys ──────────────────────────────────────────────────
const TASKS_KEY = 'tasks';

// ─── Hooks ───────────────────────────────────────────────────────
export function useTasks() { ... }
```

### Error Handling

```typescript
// Use try-catch with console.error for async operations
try {
    await setDocument(COLLECTIONS.TASKS, id, data);
} catch (error) {
    console.error('Failed to create task:', error);
    throw error;
}

// Firebase Auth error handling with user-friendly messages
export function getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        // ...
    };
    return errorMessages[errorCode] || 'An unexpected error occurred.';
}

// Use sonner for toast notifications
import { toast } from 'sonner';
toast.success('Task created successfully');
toast.error('Failed to create task');
```

### State Management

- **Server State**: Use TanStack React Query (`useQuery`, `useMutation`)
- **Client State**: Use Zustand stores (`useUIStore`)
- **Real-time updates**: Use Firebase `onSnapshot` listeners in hooks

```typescript
// React Query pattern with real-time fallback
export function useTasks(filters?: TaskFilters) {
    const queryResult = useQuery<Task[]>({
        queryKey: [TASKS_KEY, filters],
        queryFn: () => queryDocuments<Task>(COLLECTIONS.TASKS, constraints),
        staleTime: 2 * 60 * 1000,
    });
    // ... real-time listener setup
}

// Zustand store pattern
export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

### Firestore Patterns

```typescript
// Generic CRUD operations in lib/firebase/firestore.ts
export async function setDocument(
    collectionName: string,
    docId: string,
    data: DocumentData,
    merge = true
): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    return setDoc(docRef, { ...data, updated_at: serverTimestamp() }, { merge });
}

// Always include timestamps
const task = {
    ...taskData,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
};
```

### Authentication

- Use `useAuth()` hook to access auth state
- Wrap protected pages with `ProtectedRoute` component
- Role-based access via `allowedRoles` prop on `ProtectedRoute`

```typescript
const { user, employee, isAuthenticated, isApproved } = useAuth();

// In page component
<ProtectedRoute allowedRoles={['Admin', 'Manager']}>
    <DashboardPage />
</ProtectedRoute>
```

---

## UI/Styling

- **Tailwind CSS v4** with CSS custom properties for theming
- **shadcn/ui** components in `components/ui/`
- **Magic UI** registry for advanced animations
- **lucide-react** for icons (plus Material Symbols for specific cases)

### Tailwind Theme Colors

```css
/* Available in globals.css */
--primary, --accent-red, --accent-green, --accent-orange
--text-primary, --text-secondary
--surface, --card, --border
```

### Component Styling Pattern

```typescript
import { cn } from '@/lib/utils';

// Use cn() for conditional class merging
<div className={cn(
    "base-classes-here",
    isActive && "active-state-classes",
    className
)}>
```

---

## Environment Setup

Required environment variables (see `.env.local.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| next | App Router, SSR |
| firebase | Auth, Firestore, Storage |
| @tanstack/react-query | Server state management |
| zustand | Client state management |
| framer-motion | Animations |
| react-leaflet | Maps |
| sonner | Toast notifications |
| date-fns | Date formatting |
| uuid | Unique ID generation |

---

## Before Committing

1. Run `npm run lint` and fix all errors
2. Run `npx tsc --noEmit` to verify types
3. Test the feature in both light/dark themes if UI changes
4. Verify responsive behavior (mobile, tablet, desktop)
