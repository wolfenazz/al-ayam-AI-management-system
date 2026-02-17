'use client';

import React from 'react';

interface StepperNavigationProps {
    currentStep: number;
    totalSteps: number;
    canProceed: boolean;
    isSubmitting: boolean;
    onBack: () => void;
    onNext: () => void;
    onSaveDraft: () => void;
    onSendTask: () => void;
    onClose: () => void;
}

export default function StepperNavigation({
    currentStep,
    totalSteps,
    canProceed,
    isSubmitting,
    onBack,
    onNext,
    onSaveDraft,
    onSendTask,
    onClose,
}: StepperNavigationProps) {
    const isLastStep = currentStep === totalSteps;
    const isFirstStep = currentStep === 1;

    return (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-surface/50 shrink-0">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Side - Back and Close */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2 sm:px-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                        aria-label="Cancel"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        <span className="text-sm font-medium hidden sm:inline">Cancel</span>
                    </button>

                    {!isFirstStep && (
                        <button
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-3 sm:px-4 rounded-lg border border-border text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
                            aria-label="Go back"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            <span className="text-sm font-medium hidden sm:inline">Back</span>
                        </button>
                    )}
                </div>

                {/* Right Side - Draft, Next, Send */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Save Draft - Available on all steps */}
                    <button
                        onClick={onSaveDraft}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2 sm:px-4 rounded-lg border border-border text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
                        aria-label="Save draft"
                    >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        <span className="text-sm font-medium hidden sm:inline">Save Draft</span>
                    </button>

                    {/* Next Button - Steps 1-5 */}
                    {!isLastStep && (
                        <button
                            onClick={onNext}
                            disabled={!canProceed || isSubmitting}
                            className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-4 sm:px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                            aria-label="Next step"
                        >
                            <span className="text-sm">Next</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    )}

                    {/* Send Task Button - Step 6 */}
                    {isLastStep && (
                        <button
                            onClick={onSendTask}
                            disabled={!canProceed || isSubmitting}
                            className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-4 sm:px-6 rounded-lg bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold transition-all active:scale-[0.98] shadow-md shadow-whatsapp/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Send task"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span className="text-sm">Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    <span className="text-sm">Send Task</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Step Progress Indicator */}
            <div className="mt-3 flex items-center justify-center gap-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                            i + 1 === currentStep
                                ? 'w-6 sm:w-8 bg-primary'
                                : i + 1 < currentStep
                                ? 'w-3 sm:w-4 bg-accent-green'
                                : 'w-3 sm:w-4 bg-border'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
