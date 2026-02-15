# Al-Ayyam AI Platform - Agent Guidelines

## Project Overview

**Tech Stack:**
- Frontend: Next.js 16.1.6 + React 19.2.3
- Styling: Tailwind CSS v4 + Chakra UI
- Backend: Firebase (Auth, Firestore, Storage, Cloud Functions)
- AI: DeepSeek API
- Messaging: Meta WhatsApp Business API
- Testing: Vitest + @testing-library/react
- Deployment: Vercel

**Architecture:**
- Module A: AI News Engine (Automated aggregation, AI processing, review workflow)
- Module B: WhatsApp Task Command Center (Task management, WhatsApp integration, notifications)
- Real-time sync via Firebase Firestore
- Serverless backend with Firebase Cloud Functions

---

## Development Commands

### Local Development
```bash
npm run dev              # Start development server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Testing with Vitest
```bash
npm test                # Run all tests in watch mode
npm run test:ci         # Run tests once (CI mode)
npm run test:ui         # Open Vitest UI (interactive)
npm run test:coverage   # Generate coverage report
```

### Running Single Test
```bash
# Run specific test file
npm test -- path/to/component.test.tsx

# Run tests matching pattern
npm test -- --grep "TaskCard"

# Run tests in specific directory
npm test -- components/tasks/
```

### Firebase & Vercel
```bash
firebase deploy          # Deploy Firebase services
firebase emulators:start  # Start local Firebase emulators
vercel deploy          # Deploy to Vercel
vercel env pull         # Pull environment variables
```

---

## Testing Guidelines

### Test Structure
```typescript
// Component test example
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '@/components/tasks/task-card'

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'PENDING',
    priority: 'HIGH'
  }

  it('renders task title correctly', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn()
    render(<TaskCard task={mockTask} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
```

### Testing Best Practices
- Test user behavior, not implementation details
- Use `screen` queries over container queries
- Mock Firebase services in `__mocks__/firebase.ts`
- Keep tests independent (no shared state)
- Aim for 80%+ code coverage

---

## Code Style Guidelines

### Import Order (Enforced)
```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 2. Third-party libraries
import {
  Box,
  Button,
  Text,
  useToast
} from '@chakra-ui/react'
import { format } from 'date-fns'

// 3. Internal libraries (lib/)
import { useAuth } from '@/lib/hooks/use-auth'
import { taskService } from '@/lib/services/task.service'

// 4. Components
import { TaskCard } from '@/components/tasks/task-card'
import { Sidebar } from '@/components/layout/sidebar'

// 5. Types
import type { Task } from '@/lib/types/task'

// 6. Relative imports
import { localHelper } from './utils'

// 7. Styles (if needed)
import './styles.css'
```

### TypeScript Rules
- Always use explicit types for props and function returns
- Prefer `interface` for object shapes, `type` for unions/primitives
- Use `Readonly<T>` for immutable props
- Never use `any` - use `unknown` or proper types
- Enable strict mode (already configured)

```typescript
// Good
interface TaskCardProps {
  readonly task: Task
  readonly onEdit: (id: string) => void
}

// Bad
const TaskCard = ({ task, onEdit }: any) => { ... }
```

### Formatting
- Use Tailwind utility classes for styling (no custom CSS unless necessary)
- Component files: `<ComponentName>.tsx`
- Helper files: `<feature-name>.ts`
- Line length: max 120 characters
- Indentation: 2 spaces

---

## Naming Conventions

### Files & Folders
- Components: PascalCase (`TaskCard.tsx`, `NewsDashboard.tsx`)
- Utilities/Hooks: camelCase (`useTasks.ts`, `formatDate.ts`)
- Types: PascalCase (`Task.ts`, `Employee.ts`)
- Constants: kebab-case (`api-endpoints.ts`, `task-status.ts`)

### Code Naming
- Components: PascalCase (`TaskCard`, `NewsDashboard`)
- Functions/Hooks: camelCase starting with verb (`useTasks`, `fetchNews`, `formatDate`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`, `TASK_STATUS`)
- Variables: camelCase (`taskStatus`, `isLoading`, `employeeList`)
- TypeScript Types: PascalCase (`TaskType`, `NewsItem`, `Employee`)
- Interfaces: PascalCase with `Props` suffix for component props (`TaskCardProps`)
- Enums: PascalCase (`TaskStatus`, `Priority`)

### Examples
```typescript
// Component
const TaskCard: React.FC<TaskCardProps> = ({ task }) => { ... }

// Hook
function useTasks(filters?: TaskFilters) { ... }

// Function
async function fetchNewsArticles(category: string) { ... }

// Constant
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Type
type TaskStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'COMPLETED'
```

---

## Chakra UI Patterns

### Component Usage
```typescript
import {
  Box,
  Button,
  Text,
  Heading,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'

export function TaskCard({ task }: { task: Task }) {
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  return (
    <Box bg={bgColor} p={4} borderRadius="md" shadow="sm">
      <Heading size="sm" color={textColor}>{task.title}</Heading>
      <Text>{task.description}</Text>
      <Button onClick={() => showToast()}>Edit</Button>
    </Box>
  )
}
```

### Theming
- Use `useColorModeValue()` for light/dark mode support
- Prefer Chakra's color tokens (e.g., `blue.500`, `gray.800`)
- Use semantic colors for states (`red.500` for error, `green.500` for success)
- Responsive with `={{ base: 'sm', md: 'md', lg: 'lg' }}`

### Common Patterns
- Use `flex` and `grid` for layouts
- `chakra()` function to add styles to non-Chakra components
- Wrap in `<ChakraProvider>` at root layout

---

## Error Handling

### Async Operations Pattern
```typescript
async function handleTaskSubmit(data: TaskFormData) {
  try {
    const result = await taskService.create(data)
    toast({
      title: 'Task created',
      status: 'success',
      duration: 3000
    })
    return result
  } catch (error) {
    console.error('Failed to create task:', error)
    toast({
      title: 'Error creating task',
      description: error instanceof Error ? error.message : 'Unknown error',
      status: 'error',
      duration: 5000
    })
    throw error
  }
}
```

### Error Boundaries
- Wrap major sections with Error Boundaries
- Provide user-friendly fallback UI
- Log errors to Firebase Analytics

### Validation
- Use Zod schemas for form validation
- Validate before API calls
- Show inline validation errors

---

## Firebase Integration Patterns

### Firestore Operations
```typescript
import { doc, getDoc, setDoc, updateDoc, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/firestore'

// Read
const taskRef = doc(db, 'tasks', taskId)
const taskDoc = await getDoc(taskRef)
const task = taskDoc.data()

// Write
await setDoc(doc(db, 'tasks', taskId), taskData)
await updateDoc(taskRef, { status: 'COMPLETED' })

// Query
const q = query(
  collection(db, 'tasks'),
  where('assigneeId', '==', userId),
  where('status', '==', 'PENDING')
)
const snapshot = await getDocs(q)
```

### Real-time Subscriptions
```typescript
import { onSnapshot, doc } from 'firebase/firestore'
import { useEffect } from 'react'

function useTaskRealtime(taskId: string) {
  const [task, setTask] = useState<Task | null>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'tasks', taskId),
      (doc) => setTask(doc.data() as Task)
    )
    return unsubscribe
  }, [taskId])

  return task
}
```

### DeepSeek AI Integration
```typescript
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

async function generateNewsSummary(article: string) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a news editor. Summarize article concisely.'
        },
        {
          role: 'user',
          content: article
        }
      ]
    })
  })

  return response.json()
}
```

---

## Environment Variables

Required variables in `.env.local`:
```bash
# Vercel
NEXT_PUBLIC_VERCEL_URL=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# DeepSeek AI
DEEPSEEK_API_KEY=

# WhatsApp (Meta)
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
META_APP_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Vercel Deployment

### Environment Setup
1. Add all environment variables to Vercel project settings
2. Set `FIREBASE_PRIVATE_KEY` as Vercel secret
3. Configure domain in project settings

### Deployment Commands
```bash
vercel --prod          # Production deployment
vercel                 # Preview deployment
vercel logs            # View deployment logs
```

### Deployment Flow
1. Push to `main` branch → Auto-deploy to production
2. Create PR → Preview deployment generated
3. All checks must pass (tests, lint, build)

---

## Quick Reference

### Key Files
- `app/layout.tsx` - Root layout with providers
- `app/dashboard/` - Main application routes
- `lib/services/` - Business logic services
- `lib/hooks/` - Custom React hooks
- `lib/firebase/` - Firebase configuration
- `cloud-functions/` - Firebase Cloud Functions

### Common Patterns
- Real-time updates: `useRealtime()` hook
- Authenticated routes: Middleware check
- API routes: `app/dashboard/api/` directory
- Server actions: Use Next.js Server Actions for form submissions

### Documentation Links
- Next.js: https://nextjs.org/docs
- Chakra UI: https://chakra-ui.com/docs
- Vitest: https://vitest.dev
- Firebase: https://firebase.google.com/docs
- DeepSeek: https://platform.deepseek.com/api-docs
- WhatsApp API: https://developers.facebook.com/docs/whatsapp

---

## Code Quality Checklist

Before submitting code:
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript types are correct (no `any`)
- [ ] Components are tested (unit + integration)
- [ ] Error handling is implemented
- [ ] Firebase security rules are updated
- [ ] Environment variables are documented
- [ ] Code follows import order and naming conventions
