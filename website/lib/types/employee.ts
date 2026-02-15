export type EmployeeRole = 'JOURNALIST' | 'EDITOR' | 'PHOTOGRAPHER' | 'MANAGER' | 'ADMIN'

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'

export type EmployeeAvailability = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY'

export interface EmployeeLocation {
  readonly latitude?: number
  readonly longitude?: number
  readonly lastUpdated?: Date
}

export interface Employee {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly whatsappUid: string | null
  readonly phoneNumber: string | null
  readonly role: EmployeeRole
  readonly department: string | null
  readonly status: EmployeeStatus
  readonly availability: EmployeeAvailability
  readonly currentLocation: EmployeeLocation | null
  readonly skills: readonly string[]
  readonly performanceScore: number | null
  readonly responseTimeAvg: number | null
  readonly totalTasksCompleted: number
  readonly createdAt: Date
  readonly lastActive: Date | null
  readonly managerId: string | null
}

export interface EmployeeFormData {
  readonly name: string
  readonly email: string
  readonly role: EmployeeRole
  readonly department: string | null
  readonly skills: readonly string[]
  readonly whatsappUid: string | null
  readonly phoneNumber: string | null
}

export interface EmployeeFilters {
  readonly role?: EmployeeRole
  readonly status?: EmployeeStatus
  readonly availability?: EmployeeAvailability
  readonly department?: string
  readonly skills?: readonly string[]
  readonly search?: string
}
