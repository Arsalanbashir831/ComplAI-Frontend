'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';

import apiCaller from '@/config/apiCaller';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  useEffect(() => {
    const verifyAndRefreshToken = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        logoutUser();
        return;
      }

      try {
        // ✅ Verify Access Token
        await apiCaller(
          API_ROUTES.AUTH.VERIFY_TOKEN,
          'POST',
          { token: accessToken },
          {},
          false,
          'json'
        );
      } catch {
        console.warn('Access token expired. Attempting to refresh...');

        try {
          // ✅ Refresh Token
          const refreshResponse = await apiCaller(
            API_ROUTES.AUTH.REFRESH_TOKEN,
            'POST',
            { refresh_token: refreshToken },
            {},
            false,
            'json'
          );

          if (refreshResponse.status === 200 && refreshResponse.data) {
            const { accessToken: access, refreshToken: refresh } =
              refreshResponse.data;
            // ✅ Update tokens in localStorage
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch {
          console.error('Failed to refresh token. Logging out...');
          logoutUser();
        }
      }
    };
    verifyAndRefreshToken();
  }, []);

  const logoutUser = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/auth'); // ✅ Redirect to login
  };

  return <>{children}</>;
};

export default AuthProvider;
