'use client';

import React from 'react';
import { useWhatsAppStatus } from '@/hooks/useWhatsApp';

interface StepConfig {
    number: number;
    title: string;
    icon: string;
}

const steps: StepConfig[] = [
    { number: 1, title: 'Reporter', icon: 'person' },
    { number: 2, title: 'Task Details', icon: 'edit_note' },
    { number: 3, title: 'Priority', icon: 'schedule' },
    { number: 4, title: 'Description', icon: 'description' },
    { number: 5, title: 'Location', icon: 'location_on' },
    { number: 6, title: 'Media', icon: 'attach_file' },
];

interface StepperHeaderProps {
    currentStep: number;
    completedSteps: Set<number>;
    onStepClick?: (step: number) => void;
}

export default function StepperHeader({ currentStep, completedSteps, onStepClick }: StepperHeaderProps) {
    const { isConnected, isLoading } = useWhatsAppStatus();

    return (
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-border bg-surface/50">
            <div className="flex items-center justify-between gap-3">
                {/* Logo and Title - Hidden on very small screens */}
                <div className="hidden sm:flex items-center gap-4">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[20px]">newspaper</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-text-primary text-base">Task Manager</h2>
                        <span className="text-sm text-text-secondary">News Desk / tasks</span>
                    </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.has(step.number);
                        const isCurrent = currentStep === step.number;
                        const isClickable = isCompleted || step.number <= currentStep;

                        return (
                            <React.Fragment key={step.number}>
                                <button
                                    onClick={() => isClickable && onStepClick?.(step.number)}
                                    disabled={!isClickable}
                                    className={`flex items-center justify-center gap-1.5 sm:gap-2.5 min-w-[48px] min-h-[48px] px-2.5 sm:px-4 py-2.5 rounded-xl transition-all shrink-0 ${
                                        isCurrent
                                            ? 'bg-primary text-white shadow-md'
                                            : isCompleted
                                            ? 'bg-accent-green/10 text-accent-green cursor-pointer hover:bg-accent-green/20'
                                            : 'text-text-secondary hover:bg-surface'
                                    } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    aria-label={`Step ${step.number}: ${step.title}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${
                                        isCompleted && !isCurrent ? 'text-accent-green' : ''
                                    }`}>
                                        {isCompleted && !isCurrent ? 'check_circle' : step.icon}
                                    </span>
                                    <span className="text-sm font-semibold hidden xl:inline">
                                        {step.title}
                                    </span>
                                    <span className="text-sm font-semibold hidden sm:inline xl:hidden">
                                        {step.number}
                                    </span>
                                </button>

                                {/* Connector Line - Hidden on mobile */}
                                {index < steps.length - 1 && (
                                    <div className={`hidden sm:block w-5 lg:w-7 h-0.5 mx-1.5 rounded-full transition-colors shrink-0 ${
                                        completedSteps.has(step.number) || currentStep > step.number
                                            ? 'bg-accent-green'
                                            : 'bg-border'
                                    }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Status Badge - Hidden on mobile */}
                <div className={`hidden md:flex items-center gap-2.5 text-sm font-medium shrink-0 ${isConnected ? 'text-accent-green' : 'text-accent-red'}`}>
                    {isLoading ? (
                        <>
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse" />
                            <span className="hidden lg:inline">Checking...</span>
                        </>
                    ) : isConnected ? (
                        <>
                            <span className="w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse" />
                            <span className="hidden lg:inline">WhatsApp API Connected</span>
                        </>
                    ) : (
                        <>
                            <span className="w-2.5 h-2.5 rounded-full bg-accent-red" />
                            <span className="hidden lg:inline">WhatsApp Not Configured</span>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Step Title */}
            <div className="mt-3 sm:mt-4 text-center">
                <p className="text-base font-semibold text-text-primary">
                    Step {currentStep}: {steps[currentStep - 1]?.title}
                </p>
            </div>
        </div>
    );
}
