import { cache } from 'react'
import { getDocument, createDocument, updateDocument, deleteDocument } from '../firebase/firestore'
import { getCollection } from '../firebase/firestore'
import { query, where, orderBy, QueryConstraint } from 'firebase/firestore'
import type { Employee, EmployeeFormData, EmployeeFilters } from '../types/employee'

const COLLECTION = 'employees'

export const getEmployee = cache(
  async (employeeId: string): Promise<Employee | null> => {
    return getDocument<Employee>(COLLECTION, employeeId)
  }
)

export const getEmployees = cache(
  async (filters?: EmployeeFilters): Promise<Employee[]> => {
    const constraints: QueryConstraint[] = []

    if (filters?.role) {
      constraints.push(where('role', '==', filters.role))
    }

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }

    if (filters?.availability) {
      constraints.push(where('availability', '==', filters.availability))
    }

    if (filters?.department) {
      constraints.push(where('department', '==', filters.department))
    }

    constraints.push(orderBy('createdAt', 'desc'))

    return getCollection<Employee>(COLLECTION, constraints)
  }
)

export const getAvailableEmployees = cache(
  async (role?: Employee['role']): Promise<Employee[]> => {
    const constraints: QueryConstraint[] = [
      where('availability', '==', 'AVAILABLE'),
      where('status', '==', 'ACTIVE')
    ]

    if (role) {
      constraints.push(where('role', '==', role))
    }

    constraints.push(orderBy('createdAt', 'desc'))

    return getCollection<Employee>(COLLECTION, constraints)
  }
)

export async function createEmployee(data: EmployeeFormData): Promise<string> {
  const employee = {
    ...data,
    status: 'ACTIVE' as const,
    availability: 'AVAILABLE' as const,
    currentLocation: null,
    performanceScore: null,
    responseTimeAvg: null,
    totalTasksCompleted: 0,
    createdAt: new Date().toISOString(),
    lastActive: null,
    managerId: null
  }

  return createDocument(COLLECTION, employee)
}

export async function updateEmployee(
  employeeId: string,
  data: Partial<Employee>
): Promise<void> {
  await updateDocument(COLLECTION, employeeId, data)
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await deleteDocument(COLLECTION, employeeId)
}

export async function updateEmployeeAvailability(
  employeeId: string,
  availability: Employee['availability']
): Promise<void> {
  await updateEmployee(employeeId, { availability })
}

export async function updateEmployeePerformance(
  employeeId: string,
  performanceScore: number
): Promise<void> {
  await updateEmployee(employeeId, { performanceScore })
}
