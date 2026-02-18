'use client';

import React, { useState, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCreateTask } from '@/hooks/useTasks';
import { Priority, TaskType } from '@/types/common';
import { Iphone17Pro } from '@/components/ui/Iphone17Pro';
import Avatar from '@/components/ui/Avatar';
import { useEmployees, getEmployeeById } from '@/hooks/useEmployees';

import StepperHeader from './StepperHeader';
import StepperNavigation from './StepperNavigation';
import { useTaskForm, TaskFormData } from './hooks/useTaskForm';

import Step1Reporter from './steps/Step1Reporter';
import Step2TitleType from './steps/Step2TitleType';
import Step3PrioritySchedule from './steps/Step3PrioritySchedule';
import Step4Description from './steps/Step4Description';
import Step5Location from './steps/Step5Location';
import Step6Media from './steps/Step6Media';

const TOTAL_STEPS = 6;

// Memoized filter to prevent infinite re-renders
const ACTIVE_EMPLOYEE_FILTERS = { status: 'ACTIVE' as const };

// Validation check without side effects
function checkStepValid(step: number, formData: TaskFormData): boolean {
    switch (step) {
        case 1:
            return !!formData.assignee_id;
        case 2:
            return formData.title.trim().length >= 5 && !!formData.taskType;
        case 3:
            return !!formData.priority && !!formData.deadlineDate && !!formData.startTime && !!formData.endTime;
        case 4:
            return formData.description.trim().length >= 20;
        case 5:
            return !!formData.location;
        case 6:
            return true; // Media is optional
        default:
            return false;
    }
}

export default function TaskStepperModal() {
    const { createTaskModalOpen, setCreateTaskModalOpen } = useUIStore();
    const { user } = useAuth();
    const createTask = useCreateTask();
    const { employees } = useEmployees(ACTIVE_EMPLOYEE_FILTERS);
    
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    
    const {
        formData,
        errors,
        updateField,
        updateFields,
        resetForm,
        validateStep,
        getTaskDataForSubmission,
    } = useTaskForm();

    // Close modal and reset
    const handleClose = useCallback(() => {
        setCreateTaskModalOpen(false);
        setCurrentStep(1);
        setCompletedSteps(new Set());
        resetForm();
    }, [setCreateTaskModalOpen, resetForm]);

    // Navigation handlers
    const handleNext = useCallback(() => {
        if (validateStep(currentStep)) {
            setCompletedSteps((prev) => new Set([...prev, currentStep]));
            setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
        }
    }, [currentStep, validateStep]);

    const handleBack = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    const handleStepClick = useCallback((step: number) => {
        if (completedSteps.has(step) || step <= currentStep) {
            setCurrentStep(step);
        }
    }, [completedSteps, currentStep]);

    // Save draft handler
    const handleSaveDraft = useCallback(() => {
        if (!user) {
            alert('You must be logged in to save a draft.');
            return;
        }

        const taskData = getTaskDataForSubmission();
        
        createTask.mutate({
            ...taskData,
            status: 'DRAFT',
            creator_id: user.uid,
        }, {
            onSuccess: () => {
                alert('Draft saved successfully!');
                handleClose();
            },
            onError: (error) => {
                console.error('Failed to save draft:', error);
                alert('Failed to save draft. Please try again.');
            },
        });
    }, [user, getTaskDataForSubmission, createTask, handleClose]);

    // Send task handler
    const handleSendTask = useCallback(() => {
        if (!user) {
            alert('You must be logged in to create a task.');
            return;
        }

        if (!formData.assignee_id) {
            alert('Please select a reporter to assign the task to.');
            return;
        }

        const taskData = getTaskDataForSubmission();
        
        createTask.mutate({
            ...taskData,
            status: 'SENT',
            creator_id: user.uid,
        }, {
            onSuccess: () => {
                handleClose();
            },
            onError: (error) => {
                console.error('Failed to create task:', error);
                alert('Failed to send task. Please try again.');
            },
        });
    }, [user, formData.assignee_id, getTaskDataForSubmission, createTask, handleClose]);

    // Template change handler
    const handleTemplateChange = useCallback((templateId: string, updates: {
        description?: string;
        type: TaskType;
        priority: string;
        deliverables?: Record<string, number>;
    }) => {
        updateFields({
            templateId,
            taskType: updates.type,
            priority: updates.priority as Priority,
            description: updates.description || '',
            deliverables: updates.deliverables || {},
        });
    }, [updateFields]);

    // Get selected employee for preview
    const selectedEmployee = formData.assignee_id 
        ? getEmployeeById(employees, formData.assignee_id) 
        : null;

    // Check if current step can proceed (using pure validation check, no state updates)
    const canProceed = React.useMemo(() => {
        return checkStepValid(currentStep, formData);
    }, [currentStep, formData]);

    if (!createTaskModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-card sm:rounded-3xl shadow-2xl w-full sm:w-[95vw] max-w-[1400px] h-[100dvh] sm:h-[90vh] max-h-[800px] flex flex-col animate-fade-in overflow-hidden">
                {/* Stepper Header */}
                <StepperHeader
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={handleStepClick}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {currentStep === 1 && (
                            <Step1Reporter
                                selectedReporterId={formData.assignee_id}
                                onReporterSelect={(id) => updateField('assignee_id', id)}
                                errors={errors}
                            />
                        )}
                        
                        {currentStep === 2 && (
                            <Step2TitleType
                                title={formData.title}
                                taskType={formData.taskType}
                                templateId={formData.templateId}
                                onTitleChange={(title) => updateField('title', title)}
                                onTaskTypeChange={(type) => updateField('taskType', type)}
                                onTemplateChange={handleTemplateChange}
                                errors={errors}
                            />
                        )}
                        
                        {currentStep === 3 && (
                            <Step3PrioritySchedule
                                priority={formData.priority}
                                deadlineDate={formData.deadlineDate}
                                startTime={formData.startTime}
                                endTime={formData.endTime}
                                onPriorityChange={(priority) => updateField('priority', priority)}
                                onDeadlineDateChange={(date) => updateField('deadlineDate', date)}
                                onStartTimeChange={(time) => updateField('startTime', time)}
                                onEndTimeChange={(time) => updateField('endTime', time)}
                                errors={errors}
                            />
                        )}
                        
                        {currentStep === 4 && (
                            <Step4Description
                                description={formData.description}
                                deliverables={formData.deliverables}
                                onDescriptionChange={(desc) => updateField('description', desc)}
                                onDeliverablesChange={(del) => updateField('deliverables', del)}
                                errors={errors}
                            />
                        )}
                        
                        {currentStep === 5 && (
                            <Step5Location
                                location={formData.location}
                                onLocationChange={(loc) => updateField('location', loc)}
                                errors={errors}
                            />
                        )}
                        
                        {currentStep === 6 && (
                            <Step6Media
                                mediaFiles={formData.mediaFiles}
                                onMediaFilesChange={(files) => updateField('mediaFiles', files)}
                                errors={errors}
                            />
                        )}
                    </div>

                    {/* WhatsApp Preview Panel */}
                    <div className="w-[340px] shrink-0 border-l border-border overflow-y-auto p-4 bg-background dark:bg-background/50 scrollbar-thin flex flex-col items-center hidden xl:flex">
                        <div className="mb-4 flex items-center gap-2 self-start">
                            <span className="material-symbols-outlined text-[18px] text-whatsapp-dark">chat</span>
                            <h3 className="font-bold text-text-primary text-base">Message Preview</h3>
                        </div>
                        <p className="text-xs text-text-secondary mb-4 self-start">
                            Preview of the WhatsApp message to be sent.
                        </p>

                        {/* iPhone Frame with WhatsApp Preview */}
                        <Iphone17Pro width={280} height={540} className="drop-shadow-2xl shrink-0">
                            <div className="w-full h-full flex flex-col bg-[#e5ddd5]">
                                {/* WhatsApp Header */}
                                <div className="bg-whatsapp-dark px-3 py-2 flex items-center gap-2 shrink-0">
                                    <span className="material-symbols-outlined text-white/70 text-[18px]">arrow_back</span>
                                    {selectedEmployee && (
                                        <>
                                            <Avatar
                                                src={selectedEmployee.avatar_url}
                                                alt={selectedEmployee.name}
                                                size="sm"
                                                status="online"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-bold truncate">{selectedEmployee.name}</p>
                                                <p className="text-white/60 text-[10px]">online</p>
                                            </div>
                                        </>
                                    )}
                                    {!selectedEmployee && (
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/50 text-xs">Select a reporter</p>
                                        </div>
                                    )}
                                    <span className="material-symbols-outlined text-white/70 text-[18px]">more_vert</span>
                                </div>

                                {/* Chat Content */}
                                <div className="flex-1 p-3 chat-bg overflow-y-auto scrollbar-thin">
                                    <div className="flex justify-center mb-3">
                                        <span className="bg-white/80 text-text-secondary text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                                            TODAY
                                        </span>
                                    </div>

                                    {/* Task message preview */}
                                    <div className="flex flex-col items-start max-w-[90%]">
                                        <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm text-xs">
                                            <p className="font-bold text-accent-red text-[10px] mb-1">
                                                🚨 New task: {formData.title || 'Untitled Task'}
                                            </p>
                                            <p className="text-gray-800 leading-snug mb-2 text-[13px] font-normal whitespace-pre-wrap break-words max-h-[120px] overflow-y-auto scrollbar-thin">
                                                {formData.description || 'No description provided.'}
                                            </p>
                                            <div className="flex flex-col gap-0.5 text-[10px] text-text-secondary">
                                                <span>
                                                    ⏰ Schedule: {
                                                        (() => {
                                                            if (!formData.deadlineDate) return 'No Date';
                                                            const [y, m, d] = formData.deadlineDate.split('-').map(Number);
                                                            const targetDate = new Date(y, m - 1, d);
                                                            const today = new Date();
                                                            const isToday = today.getFullYear() === y && today.getMonth() === m - 1 && today.getDate() === d;

                                                            return isToday
                                                                ? 'Today'
                                                                : targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
                                                        })()
                                                    }, {formData.startTime || '09:00'} - {formData.endTime || '17:00'}
                                                </span>
                                                <span>⚡ Priority: {formData.priority}</span>
                                                {formData.location && (
                                                    <span>📍 Location: Pinned</span>
                                                )}
                                            </div>
                                            
                                            {/* Deliverables summary */}
                                            {Object.keys(formData.deliverables).length > 0 && (
                                                <div className="mt-2 pt-1 border-t border-gray-100">
                                                    <p className="text-[10px] font-semibold text-gray-500 mb-0.5">Required:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(formData.deliverables).map(([key, count]) => (
                                                            <span key={key} className="text-[9px] bg-gray-100 px-1 rounded text-gray-600">
                                                                {count}x {key.replace(/_/g, ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <span className="text-[9px] text-gray-400 block text-right mt-1">
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Input Mock */}
                                <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 shrink-0">
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">add</span>
                                    <div className="flex-1 bg-white rounded-full px-3 py-1 text-[10px] text-gray-400">
                                        Type a message
                                    </div>
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">mic</span>
                                </div>
                            </div>
                        </Iphone17Pro>

                        {/* Preview Info */}
                        <div className="mt-4 text-center w-full">
                            <p className="text-[10px] text-text-secondary">
                                Will be sent via WhatsApp Business API ∙ 🔒 End-to-end encrypted
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stepper Navigation */}
                <StepperNavigation
                    currentStep={currentStep}
                    totalSteps={TOTAL_STEPS}
                    canProceed={true}
                    isSubmitting={createTask.isPending}
                    onBack={handleBack}
                    onNext={handleNext}
                    onSaveDraft={handleSaveDraft}
                    onSendTask={handleSendTask}
                    onClose={handleClose}
                />
            </div>
        </div>
    );
}
