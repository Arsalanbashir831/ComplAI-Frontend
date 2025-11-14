// hooks/useAuth.ts
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import axios from 'axios';

import apiCaller from '@/config/apiCaller';
import { setAuthCookies } from '@/lib/cookies';

import { useSubscription } from './useSubscription';

interface SignInData {
  email: string;
  password: string;
  type: 'new' | 'old';
}

export function useAuth() {
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
      // Set tokens in cookies instead of localStorage
      setAuthCookies(access, refresh);

      // Use window.location.href for full page reload to ensure Proxy intercepts
      // This replaces the auth page in browser history, preventing back button issues
      // 2️⃣ Otherwise, route based on new vs. old user
      if (type === 'new') {
        // 1️⃣ If they arrived via a subscription link, handle it accordingly
        if (subscription) {
          if (subscription === 'topup') {
            // Set flag in localStorage to open token modal
            localStorage.setItem('openTokenModalOnSubscriptionPage', 'true');
            window.location.href = ROUTES.SUPSCRIPTION;
            return;
          } else {
            // For monthly subscription, use existing flow
            await handleSubscription(subscription);
            return;
          }
        } else {
          window.location.href = `${ROUTES.PROFILE}?type=new`;
        }
      } else {
        // Handle subscription for existing users logging in
        if (subscription) {
          if (subscription === 'topup') {
            // Set flag in localStorage to open token modal
            localStorage.setItem('openTokenModalOnSubscriptionPage', 'true');
            window.location.href = ROUTES.SUPSCRIPTION;
            return;
          } else if (subscription === 'monthly') {
            // For monthly subscription, use existing flow
            await handleSubscription(subscription);
            return;
          }
        }
        window.location.href = ROUTES.DASHBOARD;
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
