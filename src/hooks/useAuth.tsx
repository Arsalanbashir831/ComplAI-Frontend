// hooks/useAuth.ts
'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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
        // Store email temporarily for verification purposes
        localStorage.setItem('userEmail', email);
      }

      // Fetch user profile to check email verification status
      const profileResponse = await apiCaller(
        API_ROUTES.USER.GET_USER_DATA,
        'GET',
        {},
        {},
        true,
        'json'
      );

      if (profileResponse.status !== 200 || !profileResponse.data) {
        throw new Error('Failed to fetch user profile');
      }

      const userProfile = profileResponse.data;
      console.log('👤 [useAuth] User profile:', userProfile);

      // Check if email is verified
      if (!userProfile.email_verified) {
        console.log('⚠️ [useAuth] Email not verified, redirecting to verification page');
        
        // Stop loading state before redirect
        setLoading(false);
        
        // Trigger resend OTP for the user (non-blocking)
        apiCaller(
          API_ROUTES.AUTH.RESEND_VERIFICATION,
          'POST',
          { email },
          {},
          true,
          'json'
        )
          .then(() => {
            console.log('📧 [useAuth] OTP resent to email');
          })
          .catch((resendError) => {
            console.error('Failed to resend OTP:', resendError);
          });

        // Immediately redirect to verify-identity page with email
        console.log('🔀 [useAuth] Redirecting to:', `${ROUTES.VERIFY_IDENTITY}?email=${encodeURIComponent(email)}&type=login`);
        router.push(
          `${ROUTES.VERIFY_IDENTITY}?email=${encodeURIComponent(email)}&type=login`
        );
        
        // Exit function immediately
        return;
      }

      console.log('✅ [useAuth] Email verified, proceeding with normal flow');

      // 2️⃣ Otherwise, route based on new vs. old user
      if (type === 'new') {
        // 1️⃣ If they arrived via a subscription link, handle it accordingly
        if (subscription) {
          if (subscription === 'topup') {
            // Set flag in localStorage to open token modal
            localStorage.setItem('openTokenModalOnSubscriptionPage', 'true');
            router.push(ROUTES.SUPSCRIPTION);
            return;
          } else {
            // For monthly subscription, use existing flow
            await handleSubscription(subscription);
            return;
          }
        } else {
          router.push(`${ROUTES.PROFILE}?type=new`);
        }
      } else {
        // Handle subscription for existing users logging in
        if (subscription) {
          if (subscription === 'topup') {
            // Set flag in localStorage to open token modal
            localStorage.setItem('openTokenModalOnSubscriptionPage', 'true');
            router.push(ROUTES.SUPSCRIPTION);
            return;
          } else if (subscription === 'monthly') {
            // For monthly subscription, use existing flow
            await handleSubscription(subscription);
            return;
          }
        }
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
