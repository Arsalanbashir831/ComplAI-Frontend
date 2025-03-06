import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';

import apiCaller from '@/config/apiCaller';

export function OAuthButtons() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleSignIn = async (response: any) => {
    try {
      const googleToken = response.credential;

      const apiResponse = await apiCaller(
        API_ROUTES.AUTH.GOOGLE_LOGIN,
        'POST',
        { token: googleToken },
        {},
        false,
        'json'
      );

      if (apiResponse.status === 200) {
        const { access, refresh } = apiResponse.data;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);

        toast.success('Google sign-in successful');
        router.push(ROUTES.DASHBOARD);
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
        onError={() => toast.error('An error occurred during Google sign-in')}
      />
    </div>
  );
}
