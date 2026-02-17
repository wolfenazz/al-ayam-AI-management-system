'use client';

import React from 'react';
import TaskStepperModal from './stepper/TaskStepperModal';

/**
 * CreateTaskModal - Entry point for the Task Creation Stepper
 * 
 * This component now wraps the new TaskStepperModal which provides
 * a professional 6-step wizard for creating tasks:
 * 
 * Step1: Assign Reporter
 * Step2: Task Title and Type
 * Step3: Priority and Schedule
 * Step4: Description and Deliverables
 * Step5: Location (Bahrain map)
 * Step6: Media Attachments
 */
export default function CreateTaskModal() {
    return <TaskStepperModal />;
}
