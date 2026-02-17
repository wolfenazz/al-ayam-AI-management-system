'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation,  } from '@tanstack/react-query';
import {
    queryDocuments,
    addDocument,
    listenToCollection,
    listenToDocument,
    COLLECTIONS,
    where,
    orderBy,
} from '@/lib/firebase/firestore';
import { Employee } from '@/types/employee';
import { EmployeeRole, Availability } from '@/types/common';
import { QueryConstraint } from 'firebase/firestore';

// ─── Query Keys ──────────────────────────────────────────────────

const EMPLOYEES_KEY = 'employees';

// ─── Types ───────────────────────────────────────────────────────

interface EmployeeFilters {
    role?: EmployeeRole;
    availability?: Availability;
    status?: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
    search?: string;
}

// ─── Build Constraints ───────────────────────────────────────────

function buildConstraints(filters?: EmployeeFilters): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    if (filters?.role) {
        constraints.push(where('role', '==', filters.role));
    }

    if (filters?.availability) {
        constraints.push(where('availability', '==', filters.availability));
    }

    if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
    }

    constraints.push(orderBy('name', 'asc'));

    return constraints;
}

// ─── Hooks ───────────────────────────────────────────────────────

/**
 * Fetch employees with optional filters and real-time updates.
 */
export function useEmployees(filters?: EmployeeFilters) {
    const [realtimeEmployees, setRealtimeEmployees] = useState<Employee[]>([]);
    const [isListening, setIsListening] = useState(false);

    // Initial fetch via React Query
    const queryResult = useQuery<Employee[]>({
        queryKey: [EMPLOYEES_KEY, filters],
        queryFn: () => queryDocuments<Employee>(COLLECTIONS.EMPLOYEES, buildConstraints(filters)),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Real-time listener
    useEffect(() => {
        const constraints = buildConstraints(filters);
        const unsubscribe = listenToCollection<Employee>(
            COLLECTIONS.EMPLOYEES,
            constraints,
            (data) => {
                setRealtimeEmployees(data);
                setIsListening(true);
            }
        );

        return () => unsubscribe();
    }, [filters]);

    // Use real-time data when available
    const employees = isListening ? realtimeEmployees : (queryResult.data || []);

    // Client-side search
    const filteredEmployees = filters?.search
        ? employees.filter(
            (e) =>
                e.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
                e.email.toLowerCase().includes(filters.search!.toLowerCase()) ||
                e.role.toLowerCase().includes(filters.search!.toLowerCase()) ||
                e.skills?.some((s) => s.toLowerCase().includes(filters.search!.toLowerCase()))
        )
        : employees;

    return {
        employees: filteredEmployees,
        isLoading: queryResult.isLoading && !isListening,
        error: queryResult.error,
        refetch: queryResult.refetch,
    };
}

/**
 * Fetch a single employee by ID with real-time updates.
 */
export function useEmployee(employeeId: string | null) {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!employeeId) {
            setEmployee(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = listenToDocument<Employee>(
            COLLECTIONS.EMPLOYEES,
            employeeId,
            (data) => {
                setEmployee(data);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [employeeId]);

    return { employee, isLoading };
}

/**
 * Helper: look up an employee from a list by ID.
 */
export function getEmployeeById(employees: Employee[], id?: string): Employee | undefined {
    if (!id) return undefined;
    return employees.find((e) => e.id === id);
}

// ─── Mutations ───────────────────────────────────────────────────

export function useAddEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newEmployee: Omit<Employee, 'id'>) =>
            addDocument(COLLECTIONS.EMPLOYEES, newEmployee),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
        },
    });
}

export function useAddEmployees() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (employees: Omit<Employee, 'id'>[]) => {
            const promises = employees.map(emp => addDocument(COLLECTIONS.EMPLOYEES, emp));
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
        },
    });
}

/**
 * Compute employee stats from an array.
 */
export function useEmployeeStats(employees: Employee[]) {
    return {
        total: employees.length,
        active: employees.filter((e) => e.status === 'ACTIVE').length,
        available: employees.filter((e) => e.availability === 'AVAILABLE').length,
        busy: employees.filter((e) => e.availability === 'BUSY').length,
        offDuty: employees.filter((e) => e.availability === 'OFF_DUTY').length,
    };
}
