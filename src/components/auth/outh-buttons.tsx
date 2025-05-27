'use client';

import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import apiCaller from '@/config/apiCaller';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { useSubscription } from '@/hooks/useSubscription'; // adjust path as needed

export function OAuthButtons() {
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
        if (subscriptionParam === 'monthly' || subscriptionParam === 'topup') {
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
    <div>
      <GoogleLogin
        onSuccess={handleGoogleSignIn}
        onError={() =>
          toast.error('An error occurred during Google sign-in')
        }
      />
    </div>
  );
}
