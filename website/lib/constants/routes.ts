export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password'
  },
  DASHBOARD: {
    HOME: '/dashboard',
    TASKS: {
      LIST: '/dashboard/tasks',
      CREATE: '/dashboard/tasks/create',
      DETAIL: (id: string) => `/dashboard/tasks/${id}`,
      TEMPLATES: {
        LIST: '/dashboard/tasks/templates',
        CREATE: '/dashboard/tasks/templates/create'
      }
    },
    EMPLOYEES: {
      LIST: '/dashboard/employees',
      DETAIL: (id: string) => `/dashboard/employees/${id}`,
      PROFILE: (id: string) => `/dashboard/employees/${id}/profile`
    },
    NEWS: {
      LIST: '/dashboard/news',
      DETAIL: (id: string) => `/dashboard/news/${id}`,
      REVIEW: (id: string) => `/dashboard/news/${id}/review`,
      SOURCES: {
        LIST: '/dashboard/news/sources',
        CREATE: '/dashboard/news/sources/create'
      },
      ANALYTICS: '/dashboard/news/analytics',
      PUBLISHED: '/dashboard/news/published'
    },
    ANALYTICS: {
      OVERVIEW: '/dashboard/analytics',
      EMPLOYEES: '/dashboard/analytics/employees',
      PERFORMANCE: '/dashboard/analytics/performance'
    },
    SETTINGS: {
      OVERVIEW: '/dashboard/settings',
      NOTIFICATIONS: '/dashboard/settings/notifications',
      INTEGRATION: {
        WHATSAPP: '/dashboard/settings/integration/whatsapp',
        AI: '/dashboard/settings/integration/ai'
      },
      USERS: '/dashboard/settings/users',
      SYSTEM: '/dashboard/settings/system'
    }
  }
} as const
