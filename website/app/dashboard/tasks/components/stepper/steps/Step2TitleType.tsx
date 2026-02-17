'use client';

import React from 'react';
import { TaskType } from '@/types/common';
import { useTaskTemplates } from '@/hooks/useTasks';
import { StepErrors } from '../hooks/useTaskForm';

interface Step2TitleTypeProps {
    title: string;
    taskType: TaskType;
    templateId?: string;
    onTitleChange: (title: string) => void;
    onTaskTypeChange: (type: TaskType) => void;
    onTemplateChange: (templateId: string, updates: {
        description?: string;
        type: TaskType;
        priority: string;
        deliverables?: Record<string, number>;
    }) => void;
    errors: StepErrors;
}

const taskTypes: { value: TaskType; label: string; icon: string; description: string }[] = [
    { value: 'BREAKING_NEWS', label: 'Breaking News', icon: 'breaking_news', description: 'Urgent news coverage' },
    { value: 'PRESS_CONF', label: 'Press Conference', icon: 'podium', description: 'Official press events' },
    { value: 'INTERVIEW', label: 'Interview', icon: 'mic', description: 'One-on-one interviews' },
    { value: 'PHOTO_ASSIGN', label: 'Photo Assignment', icon: 'photo_camera', description: 'Photography tasks' },
    { value: 'VIDEO_ASSIGN', label: 'Video Assignment', icon: 'videocam', description: 'Video recording tasks' },
    { value: 'FACT_CHECK', label: 'Fact Check', icon: 'fact_check', description: 'Verify information' },
    { value: 'FOLLOW_UP', label: 'Follow-Up', icon: 'replay', description: 'Follow-up stories' },
    { value: 'CUSTOM', label: 'Custom', icon: 'edit_note', description: 'Custom task type' },
];

export default function Step2TitleType({
    title,
    taskType,
    templateId,
    onTitleChange,
    onTaskTypeChange,
    onTemplateChange,
    errors,
}: Step2TitleTypeProps) {
    const { templates } = useTaskTemplates();

    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const template = templates.find((t) => t.id === selectedId);
        if (template) {
            onTemplateChange(selectedId, {
                description: template.description,
                type: template.type,
                priority: template.default_priority,
                deliverables: template.required_deliverables,
            });
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6">
            {/* Step Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-primary">edit_note</span>
                    <h3 className="font-bold text-text-primary text-lg">Define Task</h3>
                </div>
                <p className="text-sm text-text-secondary">
                    Give your task a clear title and select the appropriate type.
                </p>
            </div>

            {/* Template Selector */}
            {templates.length > 0 && (
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-text-secondary mb-2">
                        Load from Template
                    </label>
                    <select
                        value={templateId || ''}
                        onChange={handleTemplateSelect}
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background cursor-pointer"
                    >
                        <option value="" disabled>Select a template to pre-fill...</option>
                        {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} - {t.type.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-text-secondary/70 mt-1">
                        Templates pre-fill task details based on common scenarios
                    </p>
                </div>
            )}

            {/* Task Title */}
            <div className="mb-6">
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                    Task Title <span className="text-accent-red">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-background ${
                        errors.title ? 'border-accent-red' : 'border-border focus:border-primary'
                    }`}
                    placeholder="e.g., Coverage: City Council Vote"
                />
                {errors.title && (
                    <p className="text-xs text-accent-red mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {errors.title}
                    </p>
                )}
                <p className="text-xs text-text-secondary/70 mt-1">
                    {title.length}/100 characters (minimum 5)
                </p>
            </div>

            {/* Task Type */}
            <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-3">
                    Task Type <span className="text-accent-red">*</span>
                </label>
                
                {errors.taskType && (
                    <div className="mb-3 bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent-red text-[18px]">error</span>
                        <span className="text-sm text-accent-red">{errors.taskType}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {taskTypes.map((type) => {
                        const isSelected = taskType === type.value;
                        
                        return (
                            <button
                                key={type.value}
                                onClick={() => onTaskTypeChange(type.value)}
                                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left min-h-[64px] ${
                                    isSelected
                                        ? 'border-primary bg-primary-light shadow-sm'
                                        : 'border-border hover:border-text-secondary/30 bg-card'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
                                }`}>
                                    <span className="material-symbols-outlined text-[20px]">{type.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold ${
                                        isSelected ? 'text-primary' : 'text-text-primary'
                                    }`}>
                                        {type.label}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-0.5 hidden sm:block">
                                        {type.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Type Summary */}
            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                            {taskTypes.find((t) => t.value === taskType)?.icon || 'task'}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary">Selected Type</p>
                        <p className="text-sm font-semibold text-text-primary">
                            {taskTypes.find((t) => t.value === taskType)?.label || 'Select a type'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
