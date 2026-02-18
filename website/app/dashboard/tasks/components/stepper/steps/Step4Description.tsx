'use client';

import React from 'react';
import DeliverablesEditor from '../../DeliverablesEditor';
import { StepErrors } from '../hooks/useTaskForm';

interface Step4DescriptionProps {
    description: string;
    deliverables: Record<string, number>;
    onDescriptionChange: (description: string) => void;
    onDeliverablesChange: (deliverables: Record<string, number>) => void;
    errors: StepErrors;
}

const deliverableOptions = [
    { key: 'articles', label: 'Articles', icon: 'article' },
    { key: 'photos', label: 'Photos', icon: 'photo_camera' },
    { key: 'videos', label: 'Videos', icon: 'videocam' },
    { key: 'interviews', label: 'Interviews', icon: 'mic' },
    { key: 'fact_checks', label: 'Fact Checks', icon: 'fact_check' },
    { key: 'social_posts', label: 'Social Posts', icon: 'share' },
];

export default function Step4Description({
    description,
    deliverables,
    onDescriptionChange,
    onDeliverablesChange,
    errors,
}: Step4DescriptionProps) {
    const handleDeliverableChange = (key: string, value: number) => {
        const newDeliverables = { ...deliverables };
        if (value <= 0) {
            delete newDeliverables[key];
        } else {
            newDeliverables[key] = value;
        }
        onDeliverablesChange(newDeliverables);
    };

    const totalDeliverables = Object.values(deliverables).reduce((sum, count) => sum + count, 0);

    return (
        <div className="h-full flex flex-col p-6 sm:p-8">
            {/* Step Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-[24px] text-primary">description</span>
                    <h3 className="font-bold text-text-primary text-xl">Description & Deliverables</h3>
                </div>
                <p className="text-base text-text-secondary">
                    Provide detailed instructions and specify what needs to be delivered.
                </p>
            </div>

            {/* Description */}
            <div className="mb-6">
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                    Detailed Description <span className="text-accent-red">*</span>
                </label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    rows={4}
                    className={`w-full px-3 sm:px-4 py-3 border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-background resize-none ${
                        errors.description ? 'border-accent-red' : 'border-border focus:border-primary'
                    }`}
                    placeholder="Provide detailed instructions for this task. Include any specific requirements, contacts, or context the reporter needs..."
                />
                {errors.description && (
                    <p className="text-xs text-accent-red mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {errors.description}
                    </p>
                )}
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-text-secondary/70">
                        {description.length} characters (minimum 20)
                    </p>
                    <p className={`text-xs ${description.length >= 20 ? 'text-accent-green' : 'text-text-secondary/70'}`}>
                        {description.length >= 20 ? '✓ Minimum reached' : `${20 - description.length} more needed`}
                    </p>
                </div>
            </div>

            {/* Deliverables */}
            <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-3">
                    Required Deliverables
                </label>
                <p className="text-xs text-text-secondary/70 mb-4">
                    Specify the expected outputs for this task. Click + or - to adjust quantities.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deliverableOptions.map((opt) => {
                        const count = deliverables[opt.key] || 0;

                        return (
                            <div
                                key={opt.key}
                                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[56px] ${
                                    count > 0
                                        ? 'border-primary bg-primary-light'
                                        : 'border-border bg-card hover:border-text-secondary/30'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-[20px] sm:text-[24px] ${
                                        count > 0 ? 'text-primary' : 'text-text-secondary'
                                    }`}>
                                        {opt.icon}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                        count > 0 ? 'text-primary' : 'text-text-primary'
                                    }`}>
                                        {opt.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDeliverableChange(opt.key, count - 1)}
                                        disabled={count <= 0}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                            count > 0
                                                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                                : 'bg-surface text-text-secondary/50 cursor-not-allowed'
                                        }`}
                                        aria-label={`Decrease ${opt.label}`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">remove</span>
                                    </button>

                                    <span className={`w-10 text-center text-base font-bold ${
                                        count > 0 ? 'text-primary' : 'text-text-secondary'
                                    }`}>
                                        {count}
                                    </span>

                                    <button
                                        onClick={() => handleDeliverableChange(opt.key, count + 1)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                            count > 0
                                                ? 'bg-primary text-white hover:bg-primary/90'
                                                : 'bg-primary/20 text-primary hover:bg-primary/30'
                                        }`}
                                        aria-label={`Increase ${opt.label}`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                            description.length >= 20 ? 'bg-accent-green/10' : 'bg-surface'
                        }`}>
                            <span className={`material-symbols-outlined text-[18px] ${
                                description.length >= 20 ? 'text-accent-green' : 'text-text-secondary'
                            }`}>
                                {description.length >= 20 ? 'check_circle' : 'edit_note'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Description</p>
                            <p className={`text-sm font-semibold ${
                                description.length >= 20 ? 'text-accent-green' : 'text-text-primary'
                            }`}>
                                {description.length >= 20 ? 'Complete' : `${20 - description.length} chars needed`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                            totalDeliverables > 0 ? 'bg-primary/10' : 'bg-surface'
                        }`}>
                            <span className={`material-symbols-outlined text-[18px] ${
                                totalDeliverables > 0 ? 'text-primary' : 'text-text-secondary'
                            }`}>
                                inventory_2
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Deliverables</p>
                            <p className="text-sm font-semibold text-text-primary">
                                {totalDeliverables > 0 ? `${totalDeliverables} items` : 'Optional'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Deliverables Preview */}
                {totalDeliverables > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(deliverables).map(([key, count]) => {
                            if (count <= 0) return null;
                            const opt = deliverableOptions.find((o) => o.key === key);
                            return (
                                <span
                                    key={key}
                                    className="text-xs bg-primary-light text-primary px-2 py-1 rounded-lg font-medium"
                                >
                                    {count}x {opt?.label || key}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
