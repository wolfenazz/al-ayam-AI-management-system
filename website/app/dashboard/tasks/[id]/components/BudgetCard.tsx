'use client';

import React from 'react';
import { Task } from '@/types/task';

export default function BudgetCard({ task }: { task: Task }) {
    // If budget is not set, we can either hide the card or show "Not set"
    // For now, let's hide it if undefined, or show 0 if 0.
    if (typeof task.budget === 'undefined') {
        return (
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Budget</h3>
                <p className="text-sm text-gray-400 italic">No budget allocated.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">Budget</h3>
                <span className="material-symbols-outlined text-gray-400">attach_money</span>
            </div>

            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                    {task.budget.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">SAR</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Total allocated budget for this task.</p>
        </div>
    );
}
