// hooks/useAuth.ts
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import axios from 'axios';

import apiCaller from '@/config/apiCaller';

import { useSubscription } from './useSubscription';

interface SignInData {
  email: string;
  password: string;
  type: 'new' | 'old';
}

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscription = searchParams.get('subscription') as
    | 'monthly'
    | 'topup'
    | null;

  const { handleSubscription } = useSubscription();

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

      if (response.status !== 200 || !response.data) {
        throw new Error('Login failed');
      }

      const { access, refresh } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
      }

      // 2️⃣ Otherwise, route based on new vs. old user
      if (type === 'new') {
        // 1️⃣ If they arrived via a subscription link, trigger it and stop.
        if (subscription) {
          await handleSubscription(subscription);
          return;
        } else {
          router.push(`${ROUTES.PROFILE}?type=new`);
        }
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || 'Invalid credentials.');
      } else {
        setError('Network error — please try again.');
      }
      // re-throw only if you need upstream handlers to catch it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}
