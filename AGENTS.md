# AGENTS.md - Al-Ayyam AI Management System

Guidelines for AI coding agents working in this monorepo.

## Project Overview

Newsroom task management platform with Next.js dashboard, Firebase backend, WhatsApp integration, and AI-powered news aggregation. Features real-time task management, role-based access control, and distributed workforce coordination.

---

## Repository Structure

```
al-ayam-AI-management-system/
├── website/              # Next.js 16 frontend (App Router)
├── functions/            # Firebase Cloud Functions (Node.js 18)
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json # Firestore indexes
└── storage.rules         # Firebase Storage rules
```

---

## Build, Lint & Test Commands

### Website (`website/`)

```bash
cd website

# Development
npm run dev                    # Start dev server on localhost:3000

# Production
npm run build                  # Build for production
npm run start                  # Start production server

# Linting
npm run lint                   # Run ESLint on all files
npx eslint app/dashboard/page.tsx          # Lint single file
npx eslint --fix app/dashboard/page.tsx    # Lint and auto-fix

# Type Checking
npx tsc --noEmit               # Type check without emitting

# Note: No test framework configured
```

### Functions (`functions/`)

```bash
cd functions

# Build
npm run build                  # Compile TypeScript to lib/
npm run build:watch            # Watch mode compilation

# Local Development
npm run serve                  # Build + Firebase emulators
npm run shell                  # Build + Functions shell

# Deployment
npm run deploy                 # Deploy to Firebase
npm run logs                   # View function logs
```

---

## Code Style Guidelines

### Imports (Website)

```typescript
// Order: 'use client' → React/Next → External → Internal @/* → Relative
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

### Imports (Functions)

```typescript
// Order: External → Firebase/Admin → Internal
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getWhatsAppConfig } from './config';
```

### TypeScript

- **Strict mode enabled** in both `website/` and `functions/`
- Prefer `interface` over `type` for object shapes
- Use union types for finite string sets (enums)

```typescript
// Type definitions pattern
export type TaskStatus = 'DRAFT' | 'SENT' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    created_at: string;  // ISO date strings in types, serverTimestamp() in Firestore
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `TaskCard`, `CreateTaskModal` |
| Hooks | camelCase + `use` prefix | `useTasks`, `useTaskStats` |
| Types/Interfaces | PascalCase | `Task`, `TaskFilters` |
| Firestore fields | snake_case | `created_at`, `assignee_id` |
| CSS classes | kebab-case | `text-text-primary` |
| Constants | SCREAMING_SNAKE_CASE | `COLLECTIONS.TASKS` |
| Functions | camelCase | `buildConstraints`, `handleUpdate` |
| Cloud Functions | camelCase | `assignTask`, `onTaskCreate` |

### Section Comments

```typescript
// ─── Section Name ─────────────────────────────────────────────────

// ─── Query Keys ──────────────────────────────────────────────────
const TASKS_KEY = 'tasks';

// ─── Types ───────────────────────────────────────────────────────
interface Task { ... }

// ─── Hooks ───────────────────────────────────────────────────────
export function useTasks() { ... }
```

### Components

```typescript
// Use forwardRef for UI components needing ref forwarding
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

// Props extending HTML attributes
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
```

### Error Handling

```typescript
// Website: try-catch with console.error + toast
import { toast } from 'sonner';

try {
    await setDocument(COLLECTIONS.TASKS, id, data);
    toast.success('Task created successfully');
} catch (error) {
    console.error('Failed to create task:', error);
    toast.error('Failed to create task');
    throw error;
}

// Functions: HttpsError for callable functions
if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
}

if (!taskDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Task not found');
}

// Log errors with context
functions.logger.error('Error assigning task', { error, taskId });
throw new functions.https.HttpsError('internal', 'Failed to assign task');
```

### State Management (Website)

- **Server State**: TanStack React Query (`useQuery`, `useMutation`)
- **Client State**: Zustand stores (`useUIStore`)
- **Real-time**: Firebase `onSnapshot` listeners

```typescript
// React Query + real-time pattern
export function useTasks(filters?: TaskFilters) {
    const [realtimeTasks, setRealtimeTasks] = useState<Task[]>([]);

    const queryResult = useQuery<Task[]>({
        queryKey: [TASKS_KEY, filters],
        queryFn: () => queryDocuments<Task>(COLLECTIONS.TASKS, constraints),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        const unsubscribe = listenToCollection<Task>(
            COLLECTIONS.TASKS, constraints, setRealtimeTasks
        );
        return () => unsubscribe();
    }, [filters]);

    return { tasks: realtimeTasks.length ? realtimeTasks : queryResult.data };
}
```

### Firestore Patterns

```typescript
// Generic CRUD (lib/firebase/firestore.ts)
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

// Collection names constant
export const COLLECTIONS = {
    EMPLOYEES: 'employees',
    TASKS: 'tasks',
    TASK_MESSAGES: 'task_messages',
    NOTIFICATIONS: 'notifications',
    TASK_TEMPLATES: 'task_templates',
    PERFORMANCE_METRICS: 'performance_metrics',
} as const;
```

### Authentication (Website)

```typescript
// Use useAuth hook
const { user, employee, isAuthenticated, isApproved } = useAuth();

// Protect pages with role-based access
<ProtectedRoute allowedRoles={['Admin', 'Manager']}>
    <DashboardPage />
</ProtectedRoute>
```

---

## Cloud Functions Patterns

### Callable Function Structure

```typescript
export const myFunction = functions.https.onCall(async (data, context) => {
    // 1. Authentication check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Auth required');
    }

    // 2. Input validation
    const { taskId } = data;
    if (!taskId) {
        throw new functions.https.HttpsError('invalid-argument', 'Task ID required');
    }

    // 3. Business logic with try-catch
    try {
        const result = await doSomething(taskId);
        return { success: true, result };
    } catch (error) {
        functions.logger.error('Error description', { error, taskId });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError('internal', 'Operation failed');
    }
});
```

### Firestore Triggers

```typescript
export const onTaskCreate = functions.firestore
    .document('tasks/{taskId}')
    .onCreate(async (snap, context) => {
        const task = snap.data();
        // Handle new task
    });
```

---

## UI/Styling (Website)

- **Tailwind CSS v4** with CSS custom properties
- **shadcn/ui** components in `components/ui/`
- **lucide-react** for icons
- **framer-motion** for animations

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
    "base-classes",
    isActive && "active-classes",
    className
)}>
```

---

## Environment Setup

### Website (`.env.local`)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Functions (via `firebase functions:config:set`)

```
whatsapp.access_token, whatsapp.phone_number_id
deepseek.api_key, deepseek.base_url
```

---

## Before Committing

1. **Website**: Run `npm run lint` and `npx tsc --noEmit` in `website/`
2. **Functions**: Run `npm run build` in `functions/`
3. Test UI in both light/dark themes
4. Verify responsive behavior (mobile, tablet, desktop)
5. Test real-time features with Firestore listeners
