'use client';

import { useState, useCallback } from 'react';
import { Priority, TaskType } from '@/types/common';

export interface TaskFormData {
    // Step1: Assign Reporter
    assignee_id: string | null;
    
    // Step2: Title and Type
    title: string;
    taskType: TaskType;
    templateId?: string;
    
    // Step3: Priority and Schedule
    priority: Priority;
    deadlineDate: string;
    startTime: string;
    endTime: string;
    
    // Step4: Description and Deliverables
    description: string;
    deliverables: Record<string, number>;
    
    // Step5: Location
    location: {
        lat: number;
        lng: number;
        address?: string;
    } | null;
    
    // Step6: Media
    mediaFiles: File[];
}

export interface StepErrors {
    assignee_id?: string;
    title?: string;
    taskType?: string;
    priority?: string;
    deadlineDate?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    mediaFiles?: string;
}

const initialFormData: TaskFormData = {
    assignee_id: null,
    title: '',
    taskType: 'BREAKING_NEWS',
    templateId: undefined,
    priority: 'NORMAL',
    deadlineDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: '',
    deliverables: {},
    location: null,
    mediaFiles: [],
};

export function useTaskForm() {
    const [formData, setFormData] = useState<TaskFormData>(initialFormData);
    const [errors, setErrors] = useState<StepErrors>({});

    const updateField = useCallback(<K extends keyof TaskFormData>(
        field: K,
        value: TaskFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when field is updated
        if (errors[field as keyof StepErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const updateFields = useCallback((updates: Partial<TaskFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        // Clear errors for updated fields
        const clearedErrors = Object.keys(updates).reduce((acc, key) => {
            acc[key as keyof StepErrors] = undefined;
            return acc;
        }, {} as StepErrors);
        setErrors(prev => ({ ...prev, ...clearedErrors }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setErrors({});
    }, []);

    const validateStep = useCallback((step: number): boolean => {
        const newErrors: StepErrors = {};

        switch (step) {
            case 1:
                if (!formData.assignee_id) {
                    newErrors.assignee_id = 'Please select a reporter';
                }
                break;
            case 2:
                if (!formData.title.trim()) {
                    newErrors.title = 'Task title is required';
                } else if (formData.title.trim().length < 5) {
                    newErrors.title = 'Task title must be at least 5 characters';
                }
                if (!formData.taskType) {
                    newErrors.taskType = 'Please select a task type';
                }
                break;
            case 3:
                if (!formData.priority) {
                    newErrors.priority = 'Please select a priority level';
                }
                if (!formData.deadlineDate) {
                    newErrors.deadlineDate = 'Please select a date';
                }
                if (!formData.startTime) {
                    newErrors.startTime = 'Start time is required';
                }
                if (!formData.endTime) {
                    newErrors.endTime = 'End time is required';
                }
                break;
            case 4:
                if (!formData.description.trim()) {
                    newErrors.description = 'Description is required';
                } else if (formData.description.trim().length < 20) {
                    newErrors.description = 'Description must be at least 20 characters';
                }
                break;
            case 5:
                if (!formData.location) {
                    newErrors.location = 'Please select a location on the map';
                }
                break;
            case 6:
                // Media is optional, no validation needed
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const getTaskDataForSubmission = useCallback(() => {
        const deadline = formData.deadlineDate && formData.endTime
            ? new Date(`${formData.deadlineDate}T${formData.endTime}`).toISOString()
            : undefined;

        return {
            title: formData.title,
            description: formData.description,
            type: formData.taskType,
            priority: formData.priority,
            assignee_id: formData.assignee_id || undefined,
            deadline,
            start_time: formData.startTime,
            end_time: formData.endTime,
            deliverables: formData.deliverables,
            location: formData.location || undefined,
            // mediaFiles will be handled separately for upload
        };
    }, [formData]);

    return {
        formData,
        errors,
        updateField,
        updateFields,
        resetForm,
        validateStep,
        getTaskDataForSubmission,
    };
}
