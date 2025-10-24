import { useCallback, useState } from 'react';

import apiCaller from '@/config/apiCaller';

import { API_ROUTES } from '../constants/apiRoutes';

type SubscriptionType = 'monthly' | 'topup';

interface UseSubscriptionReturn {
  isLoading: boolean;
  error: Error | null;
  handleSubscription: (subscription: SubscriptionType) => Promise<void>;
  clearError: () => void;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSubscription = useCallback(
    async (subscription: SubscriptionType): Promise<void> => {
      setIsLoading(true);
      setError(null);

      const isMonthly = subscription === 'monthly';
      const endpoint = isMonthly
        ? API_ROUTES.BILLING.MONTHLY_BILLING_PROCESS
        : API_ROUTES.BILLING.ONE_TIME_PAYMENT_BILLING_PROCESS;

      const payload: Record<string, number> = isMonthly
        ? { subscription_plan_id: 2 }
        : { product_id: 2 };

      try {
        const { data } = await apiCaller(
          endpoint,
          'POST',
          payload,
          {}, // extra headers
          true, // useAuth
          'json'
        );

        if (data?.checkout_url) {
          window.location.href = data.checkout_url;
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Subscription process failed');
        setError(error);
        console.error('Subscription API error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    handleSubscription,
    clearError,
  };
};
