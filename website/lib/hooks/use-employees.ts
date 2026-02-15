'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getEmployee, getEmployees, getAvailableEmployees } from '../services/employee.service'
import type { Employee, EmployeeFilters } from '../types/employee'

export function useEmployee(employeeId: string) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const data = await getEmployee(employeeId)
        setEmployee(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch employee'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployee()
  }, [employeeId])

  return { employee, isLoading, error }
}

export function useEmployees(filters?: EmployeeFilters) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await getEmployees(filters)
        setEmployees(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch employees'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [filters])

  const availableEmployees = useMemo(
    () => employees.filter((emp) => emp.availability === 'AVAILABLE'),
    [employees]
  )

  return { employees, availableEmployees, isLoading, error }
}

export function useAvailableEmployees(role?: Employee['role']) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAvailable() {
      try {
        const data = await getAvailableEmployees(role)
        setEmployees(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch employees'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailable()
  }, [role])

  return { employees, isLoading, error }
}
