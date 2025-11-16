'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';

import apiCaller from '@/config/apiCaller';
import { useClientOnly } from '@/lib/client-only';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isClient = useClientOnly();
  const [isValidating, setIsValidating] = useState(true);

  const logoutUser = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    const subscription = searchParams.get('subscription');
    const redirectTo = subscription
      ? `/auth?subscription=${encodeURIComponent(subscription)}`
      : '/auth';

    router.push(redirectTo);
  };

  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (!isClient) {
      setIsValidating(false);
      return;
    }

    const validateTokensAndRedirect = async () => {
      setIsValidating(true);

      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userEmail = localStorage.getItem('userEmail');

      console.log('🔒 [AuthProvider] Validating tokens...', {
        pathname,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserEmail: !!userEmail,
        searchParamsType: searchParams.get('type'),
      });

      // If no tokens exist and we're on auth page, allow access
      if (!accessToken && !refreshToken) {
        if (!pathname?.startsWith('/auth')) {
          logoutUser();
        }
        setIsValidating(false);
        return;
      }

      // If on auth page and tokens exist, validate and redirect to dashboard
      const isAuthPage = pathname?.startsWith('/auth') ?? false;
      // Don't redirect if user is on verify-identity page for email verification after login
      // Check both searchParams AND localStorage (userEmail exists means they just logged in with unverified email)
      const isVerifyIdentityForLogin = 
        pathname === '/auth/verify-identity' && 
        (searchParams.get('type') === 'login' || (userEmail && searchParams.get('email')));

      console.log('🔍 [AuthProvider] Check results:', {
        isAuthPage,
        isVerifyIdentityForLogin,
        willRedirectToDashboard: isAuthPage && !isVerifyIdentityForLogin,
      });

      // Step 1: Validate access token if it exists
      if (accessToken) {
        try {
          const verifyResponse = await apiCaller(
            API_ROUTES.AUTH.VERIFY_TOKEN,
            'POST',
            { token: accessToken },
            {},
            false,
            'json'
          );

          // Access token is valid
          if (verifyResponse.status === 200) {
            // If on auth page, redirect to dashboard (except for email verification)
            if (isAuthPage && !isVerifyIdentityForLogin) {
              console.log('🚀 [AuthProvider] Redirecting to dashboard...');
              router.push(ROUTES.DASHBOARD);
            } else if (isVerifyIdentityForLogin) {
              console.log('✋ [AuthProvider] Staying on verify-identity page');
            }
            setIsValidating(false);
            return;
          }
        } catch {
          // Access token is invalid, try refresh token
          console.warn('Access token validation failed. Attempting refresh...');
        }
      }

      // Step 2: Try refresh token if access token doesn't exist or is invalid
      if (refreshToken) {
        try {
          // Django REST Framework JWT uses "refresh" not "refresh_token"
          const refreshResponse = await apiCaller(
            API_ROUTES.AUTH.REFRESH_TOKEN,
            'POST',
            { refresh: refreshToken }, // Django JWT format: { refresh: "..." }
            {},
            false,
            'json'
          );

          if (refreshResponse.status === 200 && refreshResponse.data) {
            // Django JWT returns: { access: "...", refresh: "..." }
            const responseData = refreshResponse.data;
            const newAccess = responseData.access;
            const newRefresh = responseData.refresh;

            if (!newAccess || !newRefresh) {
              throw new Error('Invalid refresh response format');
            }

            // Update tokens in localStorage
            localStorage.setItem('accessToken', newAccess);
            localStorage.setItem('refreshToken', newRefresh);

            // If on auth page, redirect to dashboard (except for email verification)
            if (isAuthPage && !isVerifyIdentityForLogin) {
              console.log('🚀 [AuthProvider] Redirecting to dashboard after token refresh...');
              router.push(ROUTES.DASHBOARD);
            } else if (isVerifyIdentityForLogin) {
              console.log('✋ [AuthProvider] Staying on verify-identity page after token refresh');
            }
            setIsValidating(false);
            return;
          }
        } catch {
          // Refresh token also failed
          console.error('Refresh token validation failed');
        }
      }

      // Step 3: Both tokens failed or don't exist - remove them and redirect to auth
      if (!isAuthPage) {
        // On protected page without valid tokens - redirect to auth
        logoutUser();
      } else {
        // Already on auth page, just remove invalid tokens (don't redirect)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      setIsValidating(false);
    };

    validateTokensAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, router, isClient]);

  // Show loading state while validating tokens
  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
