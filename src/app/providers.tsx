'use client';

import { PropsWithChildren, Suspense, useEffect, useState, memo } from 'react';

import { AbortControllerProvider } from '@/contexts/abort-controller-context';
import { ChatProvider } from '@/contexts/chat-context';
import { LoaderProvider } from '@/contexts/loader-context';
import { PromptProvider } from '@/contexts/prompt-context';
import { UserProvider } from '@/contexts/user-context';
import AuthProvider from '@/provider/AuthProvider';
import QueryProvider from '@/provider/QueryClientProvider';

import LoadingSpinner from '@/components/common/loading-spinner';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Toaster } from '@/components/ui/sonner';

// Memoize the Toaster to prevent unnecessary re-renders
const MemoizedToaster = memo(Toaster);
MemoizedToaster.displayName = 'MemoizedToaster';

export function AppProviders({ children }: PropsWithChildren) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ErrorBoundary>
      <AbortControllerProvider>
        <ChatProvider>
          <PromptProvider>
            <QueryProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <AuthProvider>
                  <LoaderProvider>
                    <UserProvider>
                      {children}
                      {isMounted && (
                        <MemoizedToaster
                          richColors
                          position="top-right"
                          duration={4000}
                          closeButton
                          toastOptions={{
                            className: 'font-sans',
                          }}
                        />
                      )}
                    </UserProvider>
                  </LoaderProvider>
                </AuthProvider>
              </Suspense>
            </QueryProvider>
          </PromptProvider>
        </ChatProvider>
      </AbortControllerProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;

