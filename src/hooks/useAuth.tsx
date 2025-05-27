// hooks/useAuth.ts
'use client'
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
  type: string;
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const subscription = searchParams.get('subscription');
const {handleSubscription} = useSubscription()
//   useEffect(() => {
//     if (!subscription) return;
// if(subscription==='monthly' ){
//   handleSubscription('monthly');
// }else if(subscription==='topup'){
//   handleSubscription('topup');
// }
   
//   }, [subscription, handleSubscription]);




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
        if (type === 'old' && !subscription) {
          router.push(ROUTES.DASHBOARD);
        } else if(type === 'new' && !subscription) {
          router.push(ROUTES.PROFILE + `?type=${type}`);
        }else if(type==='new' && subscription){
          if(subscription==='monthly'){
            handleSubscription('monthly');
          }else if(subscription==='topup'){
            handleSubscription('topup');
          }
        }else if(type==='old' && subscription){
          if(subscription==='monthly'){
            handleSubscription('monthly');
          }else if(subscription==='topup'){
            handleSubscription('topup');
          }
        }else{
          router.push(ROUTES.DASHBOARD);
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
