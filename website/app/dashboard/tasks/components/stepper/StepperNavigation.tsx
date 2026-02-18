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
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-border bg-surface/50 shrink-0">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* Left Side - Back and Close */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 min-w-[48px] min-h-[48px] px-3 sm:px-4 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                        aria-label="Cancel"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                        <span className="text-sm font-medium hidden sm:inline">Cancel</span>
                    </button>

                    {!isFirstStep && (
                        <button
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 min-w-[48px] min-h-[48px] px-4 sm:px-5 rounded-xl border border-border text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
                            aria-label="Go back"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            <span className="text-sm font-medium hidden sm:inline">Back</span>
                        </button>
                    )}
                </div>

                {/* Right Side - Draft, Next, Send */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Save Draft - Available on all steps */}
                    <button
                        onClick={onSaveDraft}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 min-w-[48px] min-h-[48px] px-3 sm:px-5 rounded-xl border border-border text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
                        aria-label="Save draft"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        <span className="text-sm font-medium hidden sm:inline">Save Draft</span>
                    </button>

                    {/* Next Button - Steps 1-5 */}
                    {!isLastStep && (
                        <button
                            onClick={onNext}
                            disabled={!canProceed || isSubmitting}
                            className="flex items-center justify-center gap-2 min-w-[48px] min-h-[48px] px-5 sm:px-7 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                            aria-label="Next step"
                        >
                            <span className="text-sm">Next</span>
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    )}

                    {/* Send Task Button - Step 6 */}
                    {isLastStep && (
                        <button
                            onClick={onSendTask}
                            disabled={!canProceed || isSubmitting}
                            className="flex items-center justify-center gap-2 min-w-[48px] min-h-[48px] px-5 sm:px-7 rounded-xl bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold transition-all active:scale-[0.98] shadow-md shadow-whatsapp/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Send task"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span className="text-sm">Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                    <span className="text-sm">Send Task</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Step Progress Indicator */}
            <div className="mt-4 flex items-center justify-center gap-1.5">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all ${
                            i + 1 === currentStep
                                ? 'w-7 sm:w-9 bg-primary'
                                : i + 1 < currentStep
                                ? 'w-3.5 sm:w-5 bg-accent-green'
                                : 'w-3.5 sm:w-5 bg-border'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
