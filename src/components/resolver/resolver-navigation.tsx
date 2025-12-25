'use client';

import { CircleArrowLeft, CircleArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ResolverNavigationProps {
  onBack?: () => void;
  onSkip?: () => void;
  onNext: () => void;
  showBack?: boolean;
  showSkip?: boolean;
  nextLabel?: string;
  isLastStep?: boolean;
}

/**
 * Navigation component for the Resolver wizard.
 * Displays Go Back, Skip, and Next Step buttons based on the current step.
 */
export function ResolverNavigation({
  onBack,
  onSkip,
  onNext,
  showBack = false,
  showSkip = false,
  nextLabel = 'Next Step',
  isLastStep = false,
}: ResolverNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-4 w-full">
      {/* Left: Go Back Button */}
      <div>
        {showBack && onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="h-14 px-6 rounded-lg text-base font-semibold flex gap-2 items-center [&_svg]:!size-5 border-2 border-[#DFEAFF] bg-[#F5F8FF] text-[#04338B] hover:bg-[#F5F8FF]/60 hover:text-[#0945b4]"
          >
            <CircleArrowLeft />
            <span>Go Back</span>
          </Button>
        )}
      </div>

      {/* Center + Right: Skip & Next Step */}
      <div className="flex items-center gap-4">
        {showSkip && onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            className="h-14 px-8 rounded-lg text-base font-semibold border-2 border-[#DFEAFF] bg-[#F5F8FF] text-[#04338B] hover:bg-[#F5F8FF]/60 hover:text-[#0945b4]"
          >
            Skip
          </Button>
        )}
        <Button
          onClick={onNext}
          className="h-14 px-10 rounded-lg text-base font-semibold flex gap-3 items-center [&_svg]:!size-6"
        >
          <span>{isLastStep ? 'Resolve' : nextLabel}</span>
          {isLastStep ? <Sparkles /> : <CircleArrowRight />}
        </Button>
      </div>
    </div>
  );
}
