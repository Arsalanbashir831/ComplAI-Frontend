'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';

import apiCaller from '@/config/apiCaller';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const subscription = searchParams.get('subscription');

  const logoutUser = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    const redirectTo = subscription
      ? `/auth?subscription=${encodeURIComponent(subscription)}`
      : '/auth';

    router.push(redirectTo);
  };

  useEffect(() => {
    // **Skip** on /auth and /auth/sign-up
    // skip on /auth *and* any sub-route under /auth
    if (pathname.startsWith('/auth')) {
      return;
    }

    const verifyAndRefreshToken = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        logoutUser();
        return;
      }

      try {
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
            localStorage.setItem('accessToken', newAccess);
            localStorage.setItem('refreshToken', newRefresh);
          } else {
            throw new Error('No tokens returned');
          }
        } catch {
          console.error('Refresh failed—logging out');
          logoutUser();
        }
      }
    };

    verifyAndRefreshToken();
  }, [pathname, subscription, router]);

  return <>{children}</>;
};

export default AuthProvider;
