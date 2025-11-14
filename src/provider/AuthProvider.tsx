'use client';

import { useEffect, useRef } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import axios from 'axios';

import apiCaller from '@/config/apiCaller';
import {
  clearAuthCookies,
  getAuthCookies,
  setAuthCookies,
} from '@/lib/cookies';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Lightweight AuthProvider that only handles token refresh on 401 errors
 * Route protection and redirects are handled by Next.js Proxy (src/proxy.ts)
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // Set up axios interceptor for automatic token refresh on 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried refreshing yet
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isRefreshingRef.current
        ) {
          originalRequest._retry = true;
          isRefreshingRef.current = true;

          try {
            const { refreshToken } = getAuthCookies();

            if (!refreshToken) {
              // No refresh token - clear cookies and redirect to login
              clearAuthCookies();
              window.location.href = '/auth';
              return Promise.reject(error);
            }

            // Try to refresh tokens
            const refreshResponse = await apiCaller(
              API_ROUTES.AUTH.REFRESH_TOKEN,
              'POST',
              { refresh: refreshToken },
              {},
              false,
              'json'
            );

            if (refreshResponse.status === 200 && refreshResponse.data) {
              const { access, refresh } = refreshResponse.data;

              if (!access || !refresh) {
                throw new Error('Invalid refresh response format');
              }

              // Update cookies with new tokens
              setAuthCookies(access, refresh);

              // Retry original request with new access token
              originalRequest.headers.Authorization = `Bearer ${access}`;
              isRefreshingRef.current = false;

              // Retry the original request using axios directly
              return axios(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            // Refresh failed - clear cookies and redirect to login
            clearAuthCookies();
            isRefreshingRef.current = false;
            window.location.href = '/auth';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // No loading state or validation - Proxy handles that
  return <>{children}</>;
};

export default AuthProvider;
