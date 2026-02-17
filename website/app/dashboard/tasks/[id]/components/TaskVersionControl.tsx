'use client';

import React, { useState } from 'react';
import { Task, TaskVersion } from '@/types/task';
import Badge from '@/components/ui/Badge';

interface TaskVersionControlProps {
    task: Task;
}

export default function TaskVersionControl({ task }: TaskVersionControlProps) {
    const [isOpen, setIsOpen] = useState(false);
    const versions: TaskVersion[] = task.versions || [];

    const getChangedFieldsDisplay = (fields: string[]) => {
        if (fields.length === 0) return 'Initial version';

        const displayNames: Record<string, string> = {
            title: 'Title',
            description: 'Description',
            status: 'Status',
            priority: 'Priority',
            assignee_id: 'Assignee',
            deadline: 'Deadline',
            budget: 'Budget',
            deliverables: 'Deliverables',
            estimated_duration: 'Duration',
        };

        return fields
            .map(f => displayNames[f] || f)
            .join(', ');
    };

    const getVersionSummary = (version: TaskVersion, index: number, totalVersions: number) => {
        if (index === totalVersions - 1) {
            return 'Task created';
        }
        return `Changed: ${getChangedFieldsDisplay(version.changed_fields)}`;
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-600">history</span>
                        <h3 className="text-base font-semibold text-gray-900">Version History</h3>
                        {versions.length > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {versions.length} version{versions.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        {isOpen ? (
                            <>
                                <span className="material-symbols-outlined text-lg">expand_less</span>
                                Collapse
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                                Expand
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="p-4">
                    {versions.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                            <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">history</span>
                            <p className="text-sm text-gray-500">No version history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {[...versions].reverse().map((version, index) => {
                                const originalIndex = versions.length - 1 - index;
                                return (
                                    <div
                                        key={version.id}
                                        className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500">
                                                    v{originalIndex + 1}
                                                </span>
                                                <Badge variant="neutral">
                                                    {version.changed_by_name}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(version.changed_at).toLocaleString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-700 mb-2">
                                            {getVersionSummary(version, originalIndex, versions.length)}
                                        </p>

                                        {version.change_reason && (
                                            <p className="text-xs text-gray-500 italic">
                                                "{version.change_reason}"
                                            </p>
                                        )}

                                        {version.changed_fields.length > 0 && (
                                            <details className="mt-2 group">
                                                <summary className="text-xs text-primary cursor-pointer hover:underline list-none">
                                                    <span className="material-symbols-outlined text-sm align-middle">
                                                        visibility
                                                    </span>
                                                    View changes
                                                </summary>
                                                <div className="mt-2 p-3 bg-white rounded border border-gray-200 text-xs space-y-2">
                                                    {version.changed_fields.map(field => {
                                                        const oldValue = versions[originalIndex - 1]?.task_snapshot[field as keyof Task];
                                                        const newValue = version.task_snapshot[field as keyof Task];

                                                        return (
                                                            <div key={field} className="space-y-1">
                                                                <p className="font-medium text-gray-600 capitalize">
                                                                    {field.replace(/_/g, ' ')}
                                                                </p>
                                                                <div className="flex gap-4">
                                                                    <div className="flex-1">
                                                                        <p className="text-gray-400 mb-0.5">Before:</p>
                                                                        <p className="line-through text-red-500">
                                                                            {formatValue(oldValue)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-gray-400 mb-0.5">After:</p>
                                                                        <p className="text-green-600">
                                                                            {formatValue(newValue)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function formatValue(value: any): string {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return JSON.stringify(value);
    }
    return String(value);
}
