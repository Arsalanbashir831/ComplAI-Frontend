'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import DocxViewer from '@/components/common/DocxViewer';
import { NoSSR } from '@/components/common/no-ssr';

function UserAgreementPageInner() {
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { signIn } = useAuth();

  const searchParams = useSearchParams();

  const email = searchParams.get('email');
  const password = searchParams.get('password');
  const subscription = searchParams.get('subscription');

  // Validate required parameters on mountt
  useEffect(() => {
    if (!email || !password) {
      setError('Missing email or password. Please try signing up again.');
      toast.error('Missing email or password. Please try signing up again.');
    }
  }, [email, password]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setAgreed(e.target.checked);
  };

  const handleContinue = async () => {
    // Validate required fields
    if (!email || !password) {
      setError('Missing email or password. Please try signing up again.');
      toast.error('Missing email or password. Please try signing up again.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the terms and conditions.');
      toast.error('Please agree to the terms and conditions.');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('User agreed. Continue...');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
      });

      const signInPromise = signIn({ email, password, type: 'new' });

      await Promise.race([signInPromise, timeoutPromise]);

      // Handle subscription-based redirection
      if (subscription === 'topup') {
        // Set localStorage flag for opening token modal
        if (typeof window !== 'undefined') {
          localStorage.setItem('openTokenModalOnSubscriptionPage', 'true');
        }
        console.log(
          'Top-up flow: localStorage flag set, will redirect to subscription page'
        );
      }

      toast.success('Successfully signed in!');
      console.log('Sign in successful, redirecting...');
    } catch (err) {
      console.error('Sign in error:', err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to sign in. Please try again.';
      setError(errorMessage);

      if (errorMessage.includes('timeout')) {
        toast.error(
          'Request timed out. Please check your connection and try again.'
        );
      } else if (retryCount < 2) {
        toast.error(`Sign in failed. Retrying... (${retryCount + 1}/3)`);
        setRetryCount((prev) => prev + 1);

        // Auto-retry after 2 seconds
        setTimeout(() => {
          if (!isLoading) {
            handleContinue();
          }
        }, 2000);
      } else {
        toast.error(
          'Failed to sign in after multiple attempts. Please try again.'
        );
        setRetryCount(0); // Reset retry count
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    handleContinue();
  };

  return (
    <NoSSR
      fallback={
        <div className="min-h-screen w-full flex flex-col items-center justify-center">
          <div className="w-full">
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="mt-8 w-full max-w-3xl flex flex-col items-center">
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="mt-6 h-10 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      }
    >
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="w-full">
          <DocxViewer
            filePath="/docs/USER LICENCE AGREEMENT.docx"
            heading="User License & Agreement"
            containerClassName=" rounded-lg w-full"
            headingClassName="text-3xl font-semibold text-indigo-700 mb-6"
          />
        </div>

        <div className="mt-8 w-full max-w-3xl flex flex-col items-center">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg w-full max-w-md">
              <p className="text-sm text-red-600 text-center">{error}</p>
              {retryCount > 0 && (
                <div className="mt-2 flex justify-center gap-2">
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          )}

          <label className="flex items-start space-x-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={handleCheckboxChange}
              disabled={isLoading}
              className="mt-1 h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
            />
            <span>I have read and agree to the User License & Agreement.</span>
          </label>

          <Button
            onClick={handleContinue}
            disabled={!agreed || isLoading || !email || !password}
            className="mt-6 w-full max-w-xs"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {retryCount > 0
                  ? `Retrying... (${retryCount}/3)`
                  : 'Processing...'}
              </div>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </NoSSR>
  );
}

export default function UserAgreementPage() {
  return (
    <Suspense fallback={<UserAgreementPageFallback />}>
      <UserAgreementPageInner />
    </Suspense>
  );
}

function UserAgreementPageFallback() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <div className="w-full">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="mt-8 w-full max-w-3xl flex flex-col items-center">
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="mt-6 h-10 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
