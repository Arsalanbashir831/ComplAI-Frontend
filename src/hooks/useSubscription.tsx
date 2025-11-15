import { useCallback, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';

import apiCaller from '@/config/apiCaller';

type SubscriptionType = 'monthly' | 'topup';

interface UseSubscriptionReturn {
  isLoading: boolean;
  error: Error | null;
  handleSubscription: (subscription: SubscriptionType) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  renewSubscription: () => Promise<void>;
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

  const cancelSubscription = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCaller(
        API_ROUTES.BILLING.CANCEL_SUBSCRIPTION ||
          '/api/billing/cancel-subscription/',
        'POST',
        {},
        {},
        true,
        'json'
      );

      return response.data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to cancel subscription');
      setError(error);
      console.error('Cancel subscription API error:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renewSubscription = useCallback(async (): Promise<void> => {
    console.log('renewSubscription hook called');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling API:', API_ROUTES.BILLING.RENEW_SUBSCRIPTION);
      const response = await apiCaller(
        API_ROUTES.BILLING.RENEW_SUBSCRIPTION ||
          '/api/billing/renew-subscription/',
        'POST',
        {},
        {},
        true,
        'json'
      );
      console.log('Renew API response:', response.data);

      return response.data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to renew subscription');
      setError(error);
      console.error('Renew subscription API error:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    handleSubscription,
    cancelSubscription,
    renewSubscription,
    clearError,
  };
};
