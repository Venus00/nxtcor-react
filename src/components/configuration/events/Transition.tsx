import React from 'react';

interface StepperProps {
    currentStep: number;
    onStepClick: (step: number) => void; // Callback to handle step click
}

const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick }) => {
    const handleClick = (step: number) => {
        // Call the onStepClick callback if provided
        if (onStepClick) {
            onStepClick(step);
        }
    };

    return (
        <ol className="flex items-center w-full mb-4">
            <li className="flex w-full items-center cursor-pointer" onClick={() => handleClick(1)}>
                <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} shrink-0`}
                >
                    1
                </div>
                <p className={`ml-2 text-xl mb-1 ${currentStep === 1 ? 'text-blue-500' : 'text-gray-400'}`}>Configuration</p>
                <div
                    className={`w-full h-1 ${currentStep > 1 ? 'bg-blue-200' : 'bg-gray-200'}`}
                ></div>
            </li>

            <li className="flex w-full items-center cursor-pointer" onClick={() => handleClick(2)}>
                <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${currentStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} shrink-0`}
                >
                    2
                </div>
                <p className={`ml-2 text-xl mb-1 ${currentStep === 2 ? 'text-blue-500' : 'text-gray-400'}`}>Armement</p>
                <div
                    className={`w-full h-1 ${currentStep > 2 ? 'bg-blue-200' : 'bg-gray-200'}`}
                ></div>
            </li>

            <li className="flex w-full items-center cursor-pointer" onClick={() => handleClick(3)}>
                <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} shrink-0`}
                >
                    3
                </div>
                <p className={`ml-2 text-xl mb-1 ${currentStep === 3 ? 'text-blue-500' : 'text-gray-400'}`}>Alerte</p>
            </li>
        </ol>
    );
};

export default Stepper;
