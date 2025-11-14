'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';

import apiCaller from '@/config/apiCaller';
import { useSubscription } from '@/hooks/useSubscription'; // adjust path as needed

function OAuthButtonsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionParam = searchParams.get('subscription') as
    | 'monthly'
    | 'topup'
    | null;

  const { handleSubscription } = useSubscription();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleSignIn = async (response: any) => {
    try {
      const googleToken = response.credential;

      const apiResponse = await apiCaller(
        API_ROUTES.AUTH.GOOGLE_LOGIN,
        'POST',
        { id_token: googleToken },
        {},
        false,
        'json'
      );

      if (apiResponse.status === 200) {
        const { access, refresh } = apiResponse.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);

        toast.success('Google sign-in successful');

        // If they clicked a subscription link, process that first
        if (subscriptionParam === 'topup') {
          // Set flag in localStorage to open token modal
          localStorage.setItem('openTokenModalOnSubscriptionPage', 'true');
          router.push(ROUTES.SUPSCRIPTION);
        } else if (subscriptionParam === 'monthly') {
          // For monthly subscription, use existing flow
          await handleSubscription(subscriptionParam);
        } else {
          // otherwise just go to dashboard
          router.push(ROUTES.DASHBOARD);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.message ||
            'An error occurred during Google sign-in'
        );
      } else {
        toast.error('A network error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      <GoogleLogin
        onSuccess={handleGoogleSignIn}
        onError={() => toast.error('An error occurred during Google sign-in')}
      />
    </div>
  );
}

export function OAuthButtons() {
  return (
    <Suspense fallback={<OAuthButtonsFallback />}>
      <OAuthButtonsInner />
    </Suspense>
  );
}

function OAuthButtonsFallback() {
  return (
    <div className="flex justify-center items-center">
      <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}
