import type { EmployeeRole, EmployeeStatus, EmployeeAvailability } from '../types/employee'

export const EMPLOYEE_ROLE: Record<EmployeeRole, string> = {
  JOURNALIST: 'Journalist',
  EDITOR: 'Editor',
  PHOTOGRAPHER: 'Photographer',
  MANAGER: 'Manager',
  ADMIN: 'Administrator'
} as const

export const EMPLOYEE_STATUS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  INACTIVE: 'Inactive'
} as const

export const EMPLOYEE_AVAILABILITY: Record<EmployeeAvailability, string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  OFF_DUTY: 'Off Duty'
} as const

export const ROLE_PERMISSIONS: Record<
  EmployeeRole,
  readonly string[]
> = {
  JOURNALIST: ['tasks.view.own', 'tasks.update.own', 'media.upload.own'],
  EDITOR: [
    'tasks.view.all',
    'tasks.create',
    'tasks.update.all',
    'news.view.all',
    'news.create',
    'news.update.all',
    'news.publish'
  ],
  PHOTOGRAPHER: [
    'tasks.view.own',
    'tasks.update.own',
    'media.upload.own',
    'media.view.all'
  ],
  MANAGER: [
    'tasks.view.all',
    'tasks.create',
    'tasks.update.all',
    'tasks.delete',
    'employees.view.all',
    'employees.create',
    'employees.update.all',
    'analytics.view.all'
  ],
  ADMIN: ['*']
} as const

export const COMMON_SKILLS = [
  'interviews',
  'sports_coverage',
  'political_reporting',
  'business_news',
  'photography',
  'videography',
  'fact_checking',
  'editing',
  'breaking_news'
] as const
