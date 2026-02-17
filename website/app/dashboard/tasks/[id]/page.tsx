'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTask, useUpdateTask } from '@/hooks/useTasks';
import TaskHeader from './components/TaskHeader';
import TaskActions from './components/TaskActions';
import TaskTimeline from './components/TaskTimeline';
import Badge from '@/components/ui/Badge';
import TaskChat from './components/TaskChat';
import AssignTaskModal from './components/AssignTaskModal';
import EditTaskModal from './components/EditTaskModal';
import AssigneeCard from './components/AssigneeCard';
import DeliverablesCard from './components/DeliverablesCard';
import BudgetCard from './components/BudgetCard';
import TaskNotes from './components/TaskNotes';
import TaskVersionControl from './components/TaskVersionControl';

export default function TaskDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { task, isLoading } = useTask(id);
    const updateTask = useUpdateTask();

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <h2 className="text-xl font-semibold">Task not found</h2>
                <button
                    onClick={() => router.push('/dashboard/tasks')}
                    className="text-primary hover:underline"
                >
                    Back to Tasks
                </button>
            </div>
        );
    }

    const handleAssign = (employeeId: string) => {
        updateTask.mutate({
            id: task.id,
            updates: { assignee_id: employeeId }
        }, {
            onSuccess: () => {
                setIsAssignModalOpen(false);
            }
        });
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
            {/* Header & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <TaskHeader task={task} />
                <TaskActions
                    task={task}
                    onAssign={() => setIsAssignModalOpen(true)}
                    onEdit={() => setIsEditModalOpen(true)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Task Details, Deliverables & Timeline */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Status, Deadline, Budget Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Status */}
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Status</h3>
                            <div className="flex items-center gap-2">
                                <Badge variant="status">{task.status}</Badge>
                                {task.completed_at && (
                                    <span className="text-sm text-gray-500">
                                        on {new Date(task.completed_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                                <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                            </div>
                            <p className={`font-semibold ${task.deadline && new Date(task.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                {task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline set'}
                            </p>
                        </div>

                        {/* Budget */}
                        <BudgetCard task={task} />
                    </div>

                    {/* Deliverables */}
                    <DeliverablesCard task={task} />

                    {/* Timeline */}
                    <div className="bg-white rounded-lg border shadow-sm p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Activity Timeline</h3>
                        <TaskTimeline task={task} />
                    </div>
                </div>

                {/* Right Column: Assignee, Chat, Notes & History */}
                <div className="flex flex-col gap-6">
                    <AssigneeCard
                        assigneeId={task.assignee_id}
                        onChange={() => setIsAssignModalOpen(true)}
                    />
                    <TaskChat />
                    <TaskNotes task={task} />
                    <TaskVersionControl task={task} />
                </div>
            </div>

            {/* Modals */}
            <AssignTaskModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                currentAssigneeId={task.assignee_id}
                onAssign={handleAssign}
                isAssigning={updateTask.isPending}
            />

            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                task={task}
            />
        </div>
    );
}
