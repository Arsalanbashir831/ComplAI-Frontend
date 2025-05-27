'use client';

import apiCaller from '@/config/apiCaller';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscription = searchParams.get('subscription');

  const logoutUser = () => {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Build redirect URL, preserving subscription if present
    const redirectTo = subscription
      ? `/auth?subscription=${encodeURIComponent(subscription)}`
      : '/auth';

    router.push(redirectTo);
  };

  useEffect(() => {
    const verifyAndRefreshToken = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // If either token is missing, bail straight to login
      if (!accessToken || !refreshToken) {
        logoutUser();
        return;
      }

      try {
        // 1) Verify current access token
        await apiCaller(
          API_ROUTES.AUTH.VERIFY_TOKEN,
          'POST',
          { token: accessToken },
          {},
          false,
          'json'
        );
      } catch {
        console.warn('Access token expired. Refreshing…');

        try {
          // 2) Refresh with the refresh-token
          const refreshResponse = await apiCaller(
            API_ROUTES.AUTH.REFRESH_TOKEN,
            'POST',
            { refresh_token: refreshToken },
            {},
            false,
            'json'
          );

          if (refreshResponse.status === 200 && refreshResponse.data) {
            const { accessToken: newAccess, refreshToken: newRefresh } =
              refreshResponse.data;

            // 3) Store new tokens
            localStorage.setItem('accessToken', newAccess);
            localStorage.setItem('refreshToken', newRefresh);
          } else {
            throw new Error('Refresh endpoint didn’t return new tokens');
          }
        } catch {
          console.error('Token refresh failed—logging out');
          logoutUser();
        }
      }
    };

    verifyAndRefreshToken();
  }, [subscription]); // re-run if `subscription` changes

  return <>{children}</>;
};

export default AuthProvider;
