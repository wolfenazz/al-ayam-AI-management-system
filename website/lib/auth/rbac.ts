import type { EmployeeRole } from '../types/employee'

export const PERMISSIONS = {
  // Task permissions
  TASKS_VIEW_OWN: 'tasks.view.own',
  TASKS_VIEW_ALL: 'tasks.view.all',
  TASKS_CREATE: 'tasks.create',
  TASKS_UPDATE_OWN: 'tasks.update.own',
  TASKS_UPDATE_ALL: 'tasks.update.all',
  TASKS_DELETE: 'tasks.delete',

  // Employee permissions
  EMPLOYEES_VIEW_OWN: 'employees.view.own',
  EMPLOYEES_VIEW_ALL: 'employees.view.all',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_UPDATE_OWN: 'employees.update.own',
  EMPLOYEES_UPDATE_ALL: 'employees.update.all',
  EMPLOYEES_DELETE: 'employees.delete',

  // News permissions
  NEWS_VIEW_OWN: 'news.view.own',
  NEWS_VIEW_ALL: 'news.view.all',
  NEWS_CREATE: 'news.create',
  NEWS_UPDATE_OWN: 'news.update.own',
  NEWS_UPDATE_ALL: 'news.update.all',
  NEWS_DELETE: 'news.delete',
  NEWS_PUBLISH: 'news.publish',

  // Media permissions
  MEDIA_VIEW_OWN: 'media.view.own',
  MEDIA_VIEW_ALL: 'media.view.all',
  MEDIA_UPLOAD_OWN: 'media.upload.own',
  MEDIA_UPLOAD_ALL: 'media.upload.all',
  MEDIA_DELETE_OWN: 'media.delete.own',
  MEDIA_DELETE_ALL: 'media.delete.all',

  // Analytics permissions
  ANALYTICS_VIEW_OWN: 'analytics.view.own',
  ANALYTICS_VIEW_ALL: 'analytics.view.all',

  // Settings permissions
  SETTINGS_VIEW_OWN: 'settings.view.own',
  SETTINGS_VIEW_ALL: 'settings.view.all',
  SETTINGS_UPDATE_OWN: 'settings.update.own',
  SETTINGS_UPDATE_ALL: 'settings.update.all',

  // Admin permissions
  ADMIN_ALL: '*'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS: Record<EmployeeRole, readonly Permission[]> = {
  JOURNALIST: [
    PERMISSIONS.TASKS_VIEW_OWN,
    PERMISSIONS.TASKS_UPDATE_OWN,
    PERMISSIONS.MEDIA_UPLOAD_OWN,
    PERMISSIONS.NEWS_VIEW_ALL,
    PERMISSIONS.SETTINGS_VIEW_OWN
  ],

  EDITOR: [
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_UPDATE_ALL,
    PERMISSIONS.NEWS_VIEW_ALL,
    PERMISSIONS.NEWS_CREATE,
    PERMISSIONS.NEWS_UPDATE_ALL,
    PERMISSIONS.NEWS_PUBLISH,
    PERMISSIONS.MEDIA_VIEW_ALL,
    PERMISSIONS.MEDIA_UPLOAD_ALL,
    PERMISSIONS.ANALYTICS_VIEW_ALL
  ],

  PHOTOGRAPHER: [
    PERMISSIONS.TASKS_VIEW_OWN,
    PERMISSIONS.TASKS_UPDATE_OWN,
    PERMISSIONS.MEDIA_UPLOAD_OWN,
    PERMISSIONS.MEDIA_VIEW_ALL,
    PERMISSIONS.SETTINGS_VIEW_OWN
  ],

  MANAGER: [
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_UPDATE_ALL,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.EMPLOYEES_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE_ALL,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.NEWS_VIEW_ALL,
    PERMISSIONS.NEWS_UPDATE_ALL,
    PERMISSIONS.NEWS_PUBLISH,
    PERMISSIONS.MEDIA_VIEW_ALL,
    PERMISSIONS.MEDIA_UPLOAD_ALL,
    PERMISSIONS.MEDIA_DELETE_ALL,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.SETTINGS_VIEW_ALL,
    PERMISSIONS.SETTINGS_UPDATE_ALL
  ],

  ADMIN: [PERMISSIONS.ADMIN_ALL]
}

export function hasPermission(
  userRole: EmployeeRole | null | undefined,
  requiredPermissions: Permission | readonly Permission[]
): boolean {
  if (!userRole) return false
  if (!requiredPermissions) return false

  const rolePermissions = ROLE_PERMISSIONS[userRole]

  if (rolePermissions.includes(PERMISSIONS.ADMIN_ALL)) {
    return true
  }

  const permissionsToCheck = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions]

  return permissionsToCheck.every(perm => rolePermissions.includes(perm))
}

export function hasAnyPermission(
  userRole: EmployeeRole | null | undefined,
  requiredPermissions: readonly Permission[]
): boolean {
  if (!userRole) return false
  if (!requiredPermissions || requiredPermissions.length === 0) return false

  const rolePermissions = ROLE_PERMISSIONS[userRole]

  if (rolePermissions.includes(PERMISSIONS.ADMIN_ALL)) {
    return true
  }

  return requiredPermissions.some(perm => rolePermissions.includes(perm))
}

export function canAccessRoute(
  userRole: EmployeeRole | null | undefined,
  route: string
): boolean {
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

  if (publicRoutes.includes(route)) {
    return true
  }

  if (!userRole) {
    return false
  }

  const dashboardRoutes = ['/dashboard', '/dashboard/tasks', '/dashboard/employees', '/dashboard/news']
  const settingsRoutes = ['/dashboard/settings']
  const analyticsRoutes = ['/dashboard/analytics']

  if (dashboardRoutes.some(r => route.startsWith(r))) {
    return hasPermission(userRole, PERMISSIONS.TASKS_VIEW_OWN)
  }

  if (settingsRoutes.some(r => route.startsWith(r))) {
    return hasPermission(userRole, PERMISSIONS.SETTINGS_VIEW_OWN)
  }

  if (analyticsRoutes.some(r => route.startsWith(r))) {
    return hasPermission(userRole, PERMISSIONS.ANALYTICS_VIEW_ALL)
  }

  return true
}
