import React, { useState } from 'react';
import Configuration from './Configuration';
import Binding from './Binding';
import ArmingTable from './ArmingTable';
import Stepper from './Transition';
import { ChevronDown, ChevronUp } from 'lucide-react';




const StepForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isConfigurationOpen, setIsConfigurationOpen] = useState<boolean>(false);
    const [isArmingOpen, setIsArmingOpen] = useState<boolean>(false);
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

    const handleStepClick = (step: number) => {
        setCurrentStep(step);
        // Toggle the corresponding section
        if (step === 1) setIsConfigurationOpen(!isConfigurationOpen);
        if (step === 2) setIsArmingOpen(!isArmingOpen);
        if (step === 3) setIsAlertOpen(!isAlertOpen);
    };

    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return isConfigurationOpen ? <Configuration /> : null;
            case 2:
                return isArmingOpen ? <ArmingTable /> : null;
            case 3:
                return isAlertOpen ? <Binding /> : null;
            default:
                return null;
        }
    };



    return (
        <div>
            <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
            <div className="space-y-4">
                {/* Configuration Section */}
                <div className="border rounded-lg overflow-hidden">
                    <button
                        onClick={() => {
                            setCurrentStep(1);
                            setIsConfigurationOpen(!isConfigurationOpen);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-lg font-medium text-gray-800">Configuration</span>
                        {isConfigurationOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {isConfigurationOpen && (
                        <div className="p-4 bg-white">
                            <Configuration />
                        </div>
                    )}
                </div>

                {/* Arming Section */}
                <div className="border rounded-lg overflow-hidden">
                    <button
                        onClick={() => {
                            setCurrentStep(2);
                            setIsArmingOpen(!isArmingOpen);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-lg font-medium text-gray-800">Armement</span>
                        {isArmingOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {isArmingOpen && (
                        <div className="p-4 bg-white">
                            <ArmingTable />
                        </div>
                    )}
                </div>

                {/* Alert Section */}
                <div className="border rounded-lg overflow-hidden">
                    <button
                        onClick={() => {
                            setCurrentStep(3);
                            setIsAlertOpen(!isAlertOpen);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-lg font-medium text-gray-800">Alerte</span>
                        {isAlertOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {isAlertOpen && (
                        <div className="p-4 bg-white">
                            <Binding />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepForm;
