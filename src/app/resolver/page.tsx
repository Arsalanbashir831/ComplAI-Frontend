'use client';

import { useState } from 'react';

import { UploadedFile } from '@/types/upload';
import { ResolverMode } from '@/components/resolver/resolver-input-toggle';
import { ResolverNavigation } from '@/components/resolver/resolver-navigation';
import { ResolverStepper } from '@/components/resolver/resolver-stepper';
import { Step1Complaint } from '@/components/resolver/steps/step-1-complaint';
import { Step2Documents } from '@/components/resolver/steps/step-2-documents';
import { Step3Prompt } from '@/components/resolver/steps/step-3-prompt';

export default function ResolverPage() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [mode, setMode] = useState<ResolverMode>('documents');
  const [complaintFiles, setComplaintFiles] = useState<UploadedFile[]>([]);
  const [complaintText, setComplaintText] = useState('');

  // Step 2 state
  const [supportingFiles, setSupportingFiles] = useState<UploadedFile[]>([]);

  // Step 3 state
  const [promptText, setPromptText] = useState('');

  // Navigation handlers
  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const skip = () => {
    goNext();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Complaint
            mode={mode}
            onModeChange={setMode}
            files={complaintFiles}
            setFiles={setComplaintFiles}
            complaintText={complaintText}
            setComplaintText={setComplaintText}
          />
        );
      case 2:
        return (
          <Step2Documents
            files={supportingFiles}
            setFiles={setSupportingFiles}
          />
        );
      case 3:
        return (
          <Step3Prompt promptText={promptText} setPromptText={setPromptText} />
        );
      case 4:
        return (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-[#04338B]">
              Step 4: Preview Your Compliant
            </h3>
            <p className="text-gray-500 mt-2">Coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-poppins">
      {/* Center Column: Interactive Content */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full pt-20 pb-12 px-8 flex flex-col">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl font-medium text-[#04338B] mb-4">
              AI Powered Compliant Resolver
            </h1>
            <p className="text-[#626262]">
              Paste the complaint and add any context .<br />
              Resolve will help you generate a swift, compliant, and thoughtful
              response.
            </p>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <ResolverNavigation
            onBack={goBack}
            onSkip={skip}
            onNext={goNext}
            showBack={currentStep > 1}
            showSkip={currentStep === 2}
            isLastStep={currentStep === 4}
          />
        </div>
      </div>

      {/* Right Column: Stepper Panel */}
      <div className="w-[470px] shrink-0 flex flex-col items-end">
        <ResolverStepper currentStep={currentStep} />
      </div>
    </div>
  );
}
