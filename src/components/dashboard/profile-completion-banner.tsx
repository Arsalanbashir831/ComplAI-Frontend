'use client';

import { ROUTES } from '@/constants/routes';
import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import useUserData from '@/hooks/useUserData';
import { cn } from '@/lib/utils';

export function ProfileCompletionBanner() {
  const { data: user, isLoading } = useUserData();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal state on mount (new login)
  useEffect(() => {
    setIsDismissed(false);
  }, []);

  if (isLoading || !user) return null;

  // Check if profile is complete
  const isProfileComplete = Boolean(
    user.username &&
      user.username.length >= 3 &&
      user.phone_number &&
      user.phone_number.length > 0 &&
      user.job_title &&
      user.job_title.length >= 2 &&
      user.organization_name &&
      user.organization_name.length >= 3
  );

  // Get missing fields for display
  const missingFields: string[] = [];
  if (!user.username || user.username.length < 3)
    missingFields.push('Name');
  if (!user.phone_number || user.phone_number.length === 0)
    missingFields.push('Phone Number');
  if (!user.job_title || user.job_title.length < 2)
    missingFields.push('Job Title');
  if (!user.organization_name || user.organization_name.length < 3)
    missingFields.push('Organization');

  // Don't show banner if profile is complete or dismissed
  if (isProfileComplete || isDismissed) return null;

  return (
    <div
      className={cn(
        // Professional subtle warning bar
        'w-full bg-yellow-50 border-b border-yellow-200',
        'px-6 py-3 flex items-center justify-between gap-4',
        'shadow-sm animate-in slide-in-from-top duration-300'
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
          <AlertCircle className="h-5 w-5 text-yellow-700" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
          <p className="text-sm font-semibold text-yellow-900">
            Complete your profile to get the best experience.
          </p>
          <p className="text-xs sm:text-sm text-yellow-800">
            Missing:&nbsp;
            <span className="font-semibold">{missingFields.join(', ')}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={ROUTES.PROFILE}>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs px-4 h-9 shadow-sm transition-colors"
          >
            Complete profile
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100 rounded-full"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
