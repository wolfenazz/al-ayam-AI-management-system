'use client';

import React from 'react';
import { Task } from '@/types/task';

export default function DeliverablesCard({ task }: { task: Task }) {
    const deliverables = task.deliverables || {};
    const keys = Object.keys(deliverables);

    if (keys.length === 0) {
        return (
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deliverables</h3>
                <p className="text-sm text-gray-400 italic">No specific deliverables defined.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Required Deliverables</h3>
            <ul className="space-y-3">
                {keys.map(key => (
                    <li key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="bg-white px-3 py-1 rounded-md border text-sm font-bold text-primary shadow-sm">
                            {deliverables[key]} items
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
