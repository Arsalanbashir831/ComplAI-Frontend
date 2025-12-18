'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Add your Complaint',
    description: 'Paste the complaint and add any context',
  },
  {
    id: 2,
    title: 'Upload your Documents',
    description: 'Paste the complaint and add any context',
  },
  {
    id: 3,
    title: 'Write Your Prompt',
    description: 'Paste the complaint and add any context',
  },
  {
    id: 4,
    title: 'Preview Your Compliant',
    description: 'Paste the complaint and add any context',
  },
];

interface ResolverStepperProps {
  currentStep: number;
}

/**
 * ResolverStepper
 *
 * Stepper component following exact Figma dimensions (node 4:45):
 * - Fixed Width: 537px
 * - Border Radius: 12px (per node 4:46)
 * - Step circles: 57x56px, 30px font size (per node 4:47, 4:48)
 */
export function ResolverStepper({ currentStep }: ResolverStepperProps) {
  return (
    <div className="h-full w-full py-6 pr-6 flex flex-col items-end">
      <Card
        className={cn(
          'bg-primary border-none flex flex-col items-center overflow-hidden pb-4 pt-0 px-8 relative rounded-[12px] shadow-none max-w-[537px] w-full h-full'
        )}
      >
        {/* Header Section (from Figma 4:99) */}
        <div className="flex flex-col gap-6 h-auto items-center justify-center pt-9 pb-6 text-white w-full max-w-[475px]">
          <h2 className="font-semibold text-[27px] leading-tight w-full">
            Follow the Steps
          </h2>
          <p className="text-lg leading-snug opacity-90 w-full">
            Paste the complaint and add any context — Resolve will help you
            generate a swift, compliant, and thoughtful response.
          </p>
        </div>

        {/* Steps List (from Figma 4:102) - Using absolute container dimensions from Figma if possible */}
        <div className="flex flex-col gap-8 mt-4 w-full max-w-[475px]">
          {steps.map((step) => {
            const isActive = step.id === currentStep;

            return (
              <div
                key={step.id}
                className="flex gap-[17px] items-center text-white"
              >
                {/* Step Circle (from Figma 4:47) */}
                <div
                  className={cn(
                    'flex flex-col items-center justify-center shrink-0 w-11 h-11 rounded-full transition-all duration-300',
                    isActive
                      ? 'bg-white text-primary shadow-lg scale-110'
                      : 'bg-white/20 text-white'
                  )}
                >
                  <span className="font-medium text-2xl leading-none">
                    {step.id}
                  </span>
                </div>

                {/* Step Content (from Figma 4:51) */}
                <div className="flex flex-col items-start min-w-0">
                  <h3
                    className={cn(
                      'font-semibold text-lg leading-tight truncate w-full transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-60'
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      'text-sm leading-tight opacity-60 w-full transition-opacity',
                      isActive ? 'opacity-80' : 'opacity-40'
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Text (from Figma 4:2924) */}
        <div className="mt-auto pt-10 text-center w-full max-w-[475px]">
          <p className="text-[15px] text-white/80 leading-normal">
            Resolver is intended for informational purposes only. It may contain
            errors and does not constitute legal advice
          </p>
        </div>
      </Card>
    </div>
  );
}
