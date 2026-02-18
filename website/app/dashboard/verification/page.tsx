'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useUsersByStatus, useApproveUser, useRejectUser, useDeleteUser } from '@/hooks/useVerification';
import { ApprovalStatus, EmployeeRole } from '@/types/common';
import { Employee } from '@/types/employee';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

type TabStatus = ApprovalStatus;
type ActionType = 'approve' | 'reject' | 'delete';

const tabs: { value: TabStatus; label: string; icon: string }[] = [
    { value: 'pending', label: 'Pending', icon: 'hourglass_empty' },
    { value: 'approved', label: 'Approved', icon: 'check_circle' },
    { value: 'rejected', label: 'Rejected', icon: 'cancel' },
];

const roleColors: Record<EmployeeRole, string> = {
    'Journalist': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Editor': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Photographer': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'Manager': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function VerificationPage() {
    const [activeTab, setActiveTab] = useState<TabStatus>('pending');
    const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { users, loading } = useUsersByStatus(activeTab);
    const { approveUser } = useApproveUser();
    const { rejectUser } = useRejectUser();
    const { deleteUser } = useDeleteUser();

    const handleAction = async () => {
        if (!selectedUser || !actionType) return;

        setIsProcessing(true);
        
        try {
            if (actionType === 'approve') {
                const success = await approveUser(selectedUser.id);
                if (success) {
                    const actionText = activeTab === 'rejected' ? 'Re-approved' : 'Approved';
                    toast.success(`${selectedUser.name} has been ${actionText.toLowerCase()}`, {
                        description: 'They can now access the employee dashboard.',
                    });
                }
            } else if (actionType === 'reject') {
                const success = await rejectUser(selectedUser.id);
                if (success) {
                    const actionText = activeTab === 'approved' ? 'Revoked' : 'Rejected';
                    toast.success(`${selectedUser.name} has been ${actionText.toLowerCase()}`, {
                        description: activeTab === 'approved' 
                            ? 'Their access has been revoked.' 
                            : 'They can re-register if needed.',
                    });
                }
            } else if (actionType === 'delete') {
                const success = await deleteUser(selectedUser.id);
                if (success) {
                    toast.success(`${selectedUser.name} has been deleted`, {
                        description: 'The user has been permanently removed from the system.',
                    });
                }
            }
        } catch (error) {
            toast.error('Action failed', {
                description: 'Please try again.',
            });
        } finally {
            setIsProcessing(false);
            setSelectedUser(null);
            setActionType(null);
        }
    };

    const openActionDialog = (user: Employee, action: ActionType) => {
        setSelectedUser(user);
        setActionType(action);
    };

    const closeDialog = () => {
        setSelectedUser(null);
        setActionType(null);
        setIsProcessing(false);
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
        } catch {
            return 'Unknown date';
        }
    };

    const getDialogTitle = () => {
        if (!actionType) return '';
        
        if (actionType === 'delete') return 'Delete User';
        if (actionType === 'approve') {
            return activeTab === 'rejected' ? 'Re-approve User' : 'Approve User';
        }
        if (actionType === 'reject') {
            return activeTab === 'approved' ? 'Revoke Access' : 'Reject User';
        }
        return '';
    };

    const getDialogDescription = () => {
        if (!selectedUser || !actionType) return '';
        
        if (actionType === 'delete') {
            return `Are you sure you want to permanently delete ${selectedUser.name}? This action cannot be undone and they will be immediately logged out.`;
        }
        if (actionType === 'approve') {
            if (activeTab === 'rejected') {
                return `Are you sure you want to re-approve ${selectedUser.name}? They will regain access to the platform.`;
            }
            return `Are you sure you want to approve ${selectedUser.name}? They will gain immediate access to the platform.`;
        }
        if (actionType === 'reject') {
            if (activeTab === 'approved') {
                return `Are you sure you want to revoke access for ${selectedUser.name}? They will be immediately logged out and redirected to the pending approval page.`;
            }
            return `Are you sure you want to reject ${selectedUser.name}? They will be notified and can re-register if needed.`;
        }
        return '';
    };

    const getActionButtonText = () => {
        if (!actionType) return '';
        
        if (actionType === 'delete') return 'Delete';
        if (actionType === 'approve') {
            return activeTab === 'rejected' ? 'Re-approve' : 'Approve';
        }
        if (actionType === 'reject') {
            return activeTab === 'approved' ? 'Revoke Access' : 'Reject';
        }
        return '';
    };

    const renderActionButtons = (user: Employee) => {
        const baseButtonClass = "text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5";
        
        if (activeTab === 'pending') {
            return (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => openActionDialog(user, 'reject')}
                        className={`${baseButtonClass} text-accent-red border border-accent-red/30 hover:bg-accent-red/10`}
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                        Reject
                    </button>
                    <button
                        onClick={() => openActionDialog(user, 'approve')}
                        className={`${baseButtonClass} bg-accent-green text-white hover:bg-accent-green/90`}
                    >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Approve
                    </button>
                    <button
                        onClick={() => openActionDialog(user, 'delete')}
                        className={`${baseButtonClass} bg-accent-red text-white hover:bg-accent-red/90`}
                    >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Delete
                    </button>
                </div>
            );
        }
        
        if (activeTab === 'approved') {
            return (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => openActionDialog(user, 'reject')}
                        className={`${baseButtonClass} text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/10`}
                    >
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        Revoke Access
                    </button>
                    <button
                        onClick={() => openActionDialog(user, 'delete')}
                        className={`${baseButtonClass} bg-accent-red text-white hover:bg-accent-red/90`}
                    >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Delete
                    </button>
                </div>
            );
        }
        
        if (activeTab === 'rejected') {
            return (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => openActionDialog(user, 'approve')}
                        className={`${baseButtonClass} bg-accent-green text-white hover:bg-accent-green/90`}
                    >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Re-approve
                    </button>
                    <button
                        onClick={() => openActionDialog(user, 'delete')}
                        className={`${baseButtonClass} bg-accent-red text-white hover:bg-accent-red/90`}
                    >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Delete
                    </button>
                </div>
            );
        }
        
        return null;
    };

    return (
        <div className="flex flex-col h-full p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">User Verification</h1>
                    <p className="text-text-secondary mt-2 text-base">
                        Review and manage user account approvals
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-surface/80 p-1.5 rounded-xl w-fit border border-border/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === tab.value
                                ? 'bg-card text-primary shadow-sm border border-border/50'
                                : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                        {tab.label}
                        {tab.value === 'pending' && users.length > 0 && activeTab === 'pending' && (
                            <Badge variant="secondary" className="ml-1.5">
                                {users.length}
                            </Badge>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-80">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 text-text-secondary">
                        <span className="material-symbols-outlined text-6xl mb-6 opacity-25">
                            {activeTab === 'pending' ? 'hourglass_empty' : activeTab === 'approved' ? 'check_circle' : 'cancel'}
                        </span>
                        <p className="text-xl font-medium mb-2">
                            {activeTab === 'pending' && 'No pending approvals'}
                            {activeTab === 'approved' && 'No approved users'}
                            {activeTab === 'rejected' && 'No rejected users'}
                        </p>
                        <p className="text-sm mt-1 opacity-70">
                            {activeTab === 'pending' && 'New registrations will appear here'}
                            {activeTab === 'approved' && 'Approved users can access the platform'}
                            {activeTab === 'rejected' && 'Rejected users can re-register'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface border-b border-border">
                                <tr>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                        Role & Department
                                    </th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                        Registered
                                    </th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-4">
                                                {user.avatar_url ? (
                                                    <Image
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        width={44}
                                                        height={44}
                                                        className="rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary">
                                                            person
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-text-primary">{user.name}</p>
                                                    <p className="text-sm text-text-secondary mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col gap-1.5">
                                                <Badge className={`w-fit ${roleColors[user.role]}`}>
                                                    {user.role}
                                                </Badge>
                                                {user.department && (
                                                    <span className="text-xs text-text-secondary">
                                                        {user.department}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="text-sm text-text-secondary">
                                                {formatDate(user.created_at)}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            {user.phone_number ? (
                                                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                    <span className="material-symbols-outlined text-[18px]">phone</span>
                                                    {user.phone_number}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-text-secondary/50">Not provided</span>
                                            )}
                                        </td>
                                        <td className="py-5 px-6">
                                            {renderActionButtons(user)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Confirmation Dialog */}
            <Dialog open={!!selectedUser && !!actionType} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle className={actionType === 'delete' ? 'text-accent-red' : ''}>
                            {getDialogTitle()}
                        </DialogTitle>
                        <DialogDescription>
                            {getDialogDescription()}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedUser && (
                        <div className="flex items-center gap-3 py-4 bg-surface rounded-lg px-4">
                            {selectedUser.avatar_url ? (
                                <Image
                                    src={selectedUser.avatar_url}
                                    alt={selectedUser.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-text-primary">{selectedUser.name}</p>
                                <p className="text-sm text-text-secondary">{selectedUser.role} • {selectedUser.email}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            disabled={isProcessing}
                            variant={actionType === 'delete' ? 'destructive' : actionType === 'reject' ? 'destructive' : 'default'}
                            className={actionType === 'approve' ? 'bg-accent-green hover:bg-accent-green/90' : ''}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px] mr-1">
                                        {actionType === 'delete' ? 'delete' : actionType === 'approve' ? 'check' : 'close'}
                                    </span>
                                    {getActionButtonText()}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
