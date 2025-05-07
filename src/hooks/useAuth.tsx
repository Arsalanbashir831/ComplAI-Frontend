// hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import axios from 'axios';

import apiCaller from '@/config/apiCaller';

interface SignInData {
  email: string;
  password: string;
  type: string;
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async ({ email, password, type }: SignInData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCaller(
        API_ROUTES.AUTH.LOGIN,
        'POST',
        { email, password },
        {},
        false,
        'json'
      );
      if (response.status === 200) {
        const { access, refresh } = response.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        if (type === 'old') {
          router.push(ROUTES.DASHBOARD);
        } else {
          router.push(ROUTES.PROFILE + `?type=${type}`);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || 'Invalid email or password.');
      } else {
        setError('A network error occurred. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}
