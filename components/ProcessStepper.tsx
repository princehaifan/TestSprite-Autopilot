import React from 'react';
import type { Step } from '../types';
import { SummaryIcon, PrdIcon, TestPlanIcon, TestCodeIcon, DoneIcon } from './icons';

interface ProcessStepperProps {
    currentStep: Step;
}

const steps: { id: Step; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'SUMMARIZING', label: 'Code Summary', icon: SummaryIcon },
    { id: 'GENERATING_PRD', label: 'Generate PRD', icon: PrdIcon },
    { id: 'GENERATING_TEST_PLAN', label: 'Generate Test Plan', icon: TestPlanIcon },
    { id: 'GENERATING_TEST_CODE', label: 'Generate Test Code', icon: TestCodeIcon },
    { id: 'DONE', label: 'Completed', icon: DoneIcon },
];

export const ProcessStepper: React.FC<ProcessStepperProps> = ({ currentStep }) => {
    const getStepStatus = (stepId: Step, current: Step) => {
        const currentIndex = steps.findIndex(s => s.id === current);
        const stepIndex = steps.findIndex(s => s.id === stepId);

        if (stepIndex < currentIndex || current === 'DONE') {
            return 'completed';
        }
        if (stepIndex === currentIndex && current !== 'IDLE') {
            return 'active';
        }
        return 'inactive';
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <nav aria-label="Progress">
                <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
                    {steps.map((step, index) => {
                        const status = getStepStatus(step.id, currentStep);
                        return (
                            <li key={step.label} className="md:flex-1">
                                <div className="group flex flex-col items-center border-l-4 py-2 pl-4 border-gray-700 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                                    <div className={`flex items-center space-x-2 text-sm font-medium ${
                                        status === 'completed' ? 'text-green-400' :
                                        status === 'active' ? 'text-blue-400' : 'text-gray-500'
                                    }`}>
                                        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                                            status === 'completed' ? 'bg-green-400/20' :
                                            status === 'active' ? 'bg-blue-500/20 animate-pulse' : 'bg-gray-800'
                                        }`}>
                                            <step.icon className="w-6 h-6" />
                                        </div>
                                        <span className="ml-2">{step.label}</span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};