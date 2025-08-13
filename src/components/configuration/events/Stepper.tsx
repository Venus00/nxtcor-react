import React, { useState } from 'react';
import Configuration from './Configuration';
import Binding from './Binding';
import ArmingTable from './ArmingTable';
import Stepper from './Transition';




const StepForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);

    const handleStepClick = (step: number) => {
        setCurrentStep(step);
        // Additional logic for handling step change can be added here
    };
    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return <Configuration/>;
            case 2:
                return <ArmingTable  />;
            case 3:
                return <Binding  />;
            default:
                return null;
        }
    };



    return (
        <div>
             <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
            <div className="space-y-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default StepForm;
