'use client';

import React from 'react';

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
    return (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-surface/50">
            <div className="flex items-center justify-between gap-2">
                {/* Logo and Title - Hidden on very small screens */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[18px]">newspaper</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-text-primary text-sm">Task Manager</h2>
                        <span className="text-xs text-text-secondary">News Desk / tasks</span>
                    </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.has(step.number);
                        const isCurrent = currentStep === step.number;
                        const isClickable = isCompleted || step.number <= currentStep;

                        return (
                            <React.Fragment key={step.number}>
                                <button
                                    onClick={() => isClickable && onStepClick?.(step.number)}
                                    disabled={!isClickable}
                                    className={`flex items-center justify-center gap-1 sm:gap-2 min-w-[44px] min-h-[44px] px-2 sm:px-3 py-2 rounded-lg transition-all shrink-0 ${
                                        isCurrent
                                            ? 'bg-primary text-white shadow-md'
                                            : isCompleted
                                            ? 'bg-accent-green/10 text-accent-green cursor-pointer hover:bg-accent-green/20'
                                            : 'text-text-secondary hover:bg-surface'
                                    } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    aria-label={`Step ${step.number}: ${step.title}`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${
                                        isCompleted && !isCurrent ? 'text-accent-green' : ''
                                    }`}>
                                        {isCompleted && !isCurrent ? 'check_circle' : step.icon}
                                    </span>
                                    <span className="text-xs font-semibold hidden xl:inline">
                                        {step.title}
                                    </span>
                                    <span className="text-xs font-semibold hidden sm:inline xl:hidden">
                                        {step.number}
                                    </span>
                                </button>

                                {/* Connector Line - Hidden on mobile */}
                                {index < steps.length - 1 && (
                                    <div className={`hidden sm:block w-4 lg:w-6 h-0.5 mx-1 rounded-full transition-colors shrink-0 ${
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
                <div className="hidden md:flex items-center gap-2 text-xs text-accent-green font-medium shrink-0">
                    <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                    <span className="hidden lg:inline">WhatsApp API Connected</span>
                </div>
            </div>

            {/* Mobile Step Title */}
            <div className="mt-2 sm:mt-3 text-center">
                <p className="text-sm font-semibold text-text-primary">
                    Step {currentStep}: {steps[currentStep - 1]?.title}
                </p>
            </div>
        </div>
    );
}
