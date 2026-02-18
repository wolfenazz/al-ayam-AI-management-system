'use client';

import { useState, useEffect, useCallback } from 'react';
import { where, orderBy } from 'firebase/firestore';
import { listenToCollection, listenToDocument, queryDocuments, updateDocument, COLLECTIONS } from '@/lib/firebase/firestore';
import { Employee } from '@/types/employee';
import { ApprovalStatus } from '@/types/common';

// Hook to listen to users by approval status (real-time)
export function useUsersByStatus(status: ApprovalStatus) {
    const [users, setUsers] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        
        const unsubscribe = listenToCollection<Employee>(
            COLLECTIONS.EMPLOYEES,
            [where('approvalStatus', '==', status), orderBy('created_at', 'desc')],
            (data) => {
                setUsers(data);
                setLoading(false);
            }
        );

        // Handle errors in the callback
        const originalOnError = console.error;
        console.error = (...args: unknown[]) => {
            if (args[0] instanceof Error) {
                setError(args[0]);
                setLoading(false);
            }
            originalOnError.apply(console, args);
        };

        return () => {
            unsubscribe();
            console.error = originalOnError;
        };
    }, [status]);

    return { users, loading, error };
}

// Hook to get pending users count (for sidebar badge)
export function usePendingUsersCount() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const users = await queryDocuments<Employee>(
                    COLLECTIONS.EMPLOYEES,
                    [where('approvalStatus', '==', 'pending')]
                );
                setCount(users.length);
            } catch (error) {
                console.error('Error fetching pending users count:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
    }, []);

    return { count, loading };
}

// Hook to approve a user
export function useApproveUser() {
    const [isApproving, setIsApproving] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const approveUser = useCallback(async (userId: string) => {
        setIsApproving(true);
        setError(null);
        
        try {
            await updateDocument(COLLECTIONS.EMPLOYEES, userId, {
                approvalStatus: 'approved',
                status: 'ACTIVE',
            });
            setIsApproving(false);
            return true;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to approve user');
            setError(error);
            setIsApproving(false);
            return false;
        }
    }, []);

    return { approveUser, isApproving, error };
}

// Hook to reject a user
export function useRejectUser() {
    const [isRejecting, setIsRejecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const rejectUser = useCallback(async (userId: string) => {
        setIsRejecting(true);
        setError(null);
        
        try {
            await updateDocument(COLLECTIONS.EMPLOYEES, userId, {
                approvalStatus: 'rejected',
                status: 'INACTIVE',
            });
            setIsRejecting(false);
            return true;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to reject user');
            setError(error);
            setIsRejecting(false);
            return false;
        }
    }, []);

    return { rejectUser, isRejecting, error };
}

// Hook to delete a user (Admin/Manager only)
export function useDeleteUser() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteUser = useCallback(async (userId: string) => {
        setIsDeleting(true);
        setError(null);
        
        try {
            // Get the current user's ID token for authorization
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                throw new Error('You must be logged in to delete users');
            }

            const token = await currentUser.getIdToken();

            // Call the API route to delete the user
            const response = await fetch('/api/users/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }

            setIsDeleting(false);
            return true;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete user');
            setError(error);
            setIsDeleting(false);
            return false;
        }
    }, []);

    return { deleteUser, isDeleting, error };
}

// Hook to listen to current user's approval status
export function useUserApprovalStatus(userId: string | null) {
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        
        const unsubscribe = listenToDocument<Employee>(
            COLLECTIONS.EMPLOYEES,
            userId,
            (employee) => {
                if (employee) {
                    setApprovalStatus(employee.approvalStatus || 'approved');
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return { approvalStatus, loading };
}
