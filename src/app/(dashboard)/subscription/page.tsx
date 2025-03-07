'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useUserContext } from '@/contexts/user-context';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import type { PaymentCard, Plan, Subscription } from '@/types/subscription';
import apiCaller from '@/config/apiCaller';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/common/loading-spinner';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { PaymentMethod } from '@/components/dashboard/subscription/payment-method';
import { PricingCard } from '@/components/dashboard/subscription/pricing-card';
import { SubscriptionInfo } from '@/components/dashboard/subscription/subscription-info';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

// Fetch payment cards
const fetchPaymentCards = async (): Promise<PaymentCard[]> => {
  const response = await apiCaller(
    API_ROUTES.BILLING.LIST_CARDS,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data.cards.map(
    (card: {
      id: string;
      card: { funding: string; brand: string; last4: string };
    }) => ({
      id: card.id,
      type: card.card.funding, // "credit" or "debit"
      brand: card.card.brand,
      lastFour: card.card.last4, // rename last4 to lastFour
      isDefault: false,
    })
  );
};

// Fetch subscription items and build plans array.
const fetchSubscriptionItems = async (): Promise<Plan[]> => {
  const response = await apiCaller(
    API_ROUTES.BILLING.ITEMS,
    'GET',
    {},
    {},
    true,
    'json'
  );
  const { products, subscription_plans } = response.data;
  const plansArray: Plan[] = [];

  if (products && products.length > 0) {
    const product = products[0];
    plansArray.push({
      type: 'free',
      title: product.name,
      price: `£${(product.price / 100).toFixed(0)}`,
      description: product.description,
      buttonText: 'Purchase Tokens',
      special: false,
      buttonAction: () => {},
    });
  }

  if (subscription_plans && subscription_plans.length > 0) {
    const subPlan = subscription_plans[0];
    plansArray.push({
      type: 'subscription',
      title: subPlan.name,
      price: `£${(subPlan.price / 100).toFixed(0)}`,
      interval: subPlan.interval,
      description: subPlan.description,
      buttonText: 'Subscribe',
      special: true,
      buttonAction: () => {},
    });
  }

  plansArray.push({
    type: 'enterprise',
    title: 'Enterprise',
    price: '£POA',
    minimumTerm: '24 Months',
    description:
      'Our most powerful solution, packed with every feature to meet the highest compliance demands. Ideal for firms operating in high‑risk sectors, servicing multiple areas of law, or managing high‑volume litigation. Custom solutions are also available to meet specific needs.',
    buttonText: 'Contact Sales',
    special: false,
    buttonAction: () => {},
  });

  return plansArray;
};

// Fetch the stripe customer info, which includes the default card ID
const fetchStripeCustomer = async (): Promise<{
  default_payment_method: string;
}> => {
  const response = await apiCaller(
    API_ROUTES.BILLING.STRIPE_CUSTOMER,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
};

const fetchUserSubscriptions = async (): Promise<Subscription[]> => {
  const response = await apiCaller(
    API_ROUTES.BILLING.USER_SUBSCRIPTIONS,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
};

export default function SubscriptionPage() {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const isSubscribing = useIsMutating() > 0;
  const [autoRenew, setAutoRenew] = useState(true);

  const { data: paymentCards = [], isLoading: cardsLoading } = useQuery<
    PaymentCard[]
  >({
    queryKey: ['paymentCards'],
    queryFn: fetchPaymentCards,
    staleTime: 1000 * 60 * 5,
  });

  const { data: fetchedPlans = [], isLoading: plansLoading } = useQuery<Plan[]>(
    {
      queryKey: ['subscriptionItems'],
      queryFn: fetchSubscriptionItems,
      staleTime: 1000 * 60 * 5,
    }
  );

  // Query to fetch the stripe customer info
  const { data: stripeCustomer, refetch: refetchCustomer } = useQuery({
    queryKey: ['stripeCustomer'],
    queryFn: fetchStripeCustomer,
    staleTime: 1000 * 60 * 5,
  });

  // New query to fetch user subscriptions data
  const { data: userSubscriptions, isLoading: subscriptionsLoading } = useQuery(
    {
      queryKey: ['userSubscriptions'],
      queryFn: fetchUserSubscriptions,
      staleTime: 1000 * 60 * 5,
    }
  );

  // Log the subscriptions data when it becomes available
  useEffect(() => {
    if (userSubscriptions) {
      console.log('User Subscriptions:', userSubscriptions);
    }
  }, [userSubscriptions]);

  const purchaseTokensMutation = useMutation({
    mutationFn: async () => {
      let paymentMethodId: string | undefined;
      const defaultCard = paymentCards.find((card) => card.isDefault);
      if (defaultCard) {
        paymentMethodId = defaultCard.id;
      } else if (paymentCards.length > 0) {
        paymentMethodId = paymentCards[0].id;
      }
      if (!paymentMethodId) {
        throw new Error(
          'Please add a payment method before purchasing tokens.'
        );
      }
      const response = await apiCaller(
        API_ROUTES.BILLING.CREATE_ONE_TIME_PAYMENT_INTENT,
        'POST',
        { product_id: 2, payment_method_id: paymentMethodId },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Token purchase successful!');
    },
    onError: () => {
      toast.error('Token purchase failed, please try again.');
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const paymentMethodId = stripeCustomer?.default_payment_method;

      if (!paymentMethodId) {
        throw new Error('Please add a payment method before subscribing.');
      }
      const response = await apiCaller(
        API_ROUTES.BILLING.SUBSCRIBE,
        'POST',
        {
          subscription_plan_id: 2,
          payment_method_id: paymentMethodId,
        },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Subscription successful!');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Subscription failed, please try again.'
      );
    },
  });

  const plansWithActions = fetchedPlans.map((plan) => {
    if (plan.type === 'free') {
      return {
        ...plan,
        buttonAction: () => purchaseTokensMutation.mutate(),
      };
    } else if (plan.type === 'subscription') {
      return {
        ...plan,
        buttonAction: () => subscribeMutation.mutate(),
      };
    } else {
      return {
        ...plan,
        buttonAction: () => {},
      };
    }
  });

  const handleAutoRenewChange = useMutation({
    mutationFn: async () => {
      const response = await apiCaller(
        API_ROUTES.BILLING.CANCEL_AUTO_RENEW,
        'POST',
        {},
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: () => {
      setAutoRenew(!autoRenew);
      toast.success('Auto-renewal settings updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update auto-renewal settings.');
    },
  });

  const handleAddCard = () => {
    queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
  };

  const handleUpdateCard = () => {
    queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
  };

  const handleRemoveCard = () => {
    queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      <DashboardHeader title="Subscription" />

      <Elements stripe={stripePromise}>
        <div className="flex flex-col justify-center flex-1 w-full bg-white rounded-xl p-8 space-y-8 mt-3">
          <div>
            <h1 className="text-2xl font-semibold mb-6">Plans</h1>
            {plansLoading || subscriptionsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plansWithActions.map((plan) => (
                  <PricingCard
                    key={plan.type}
                    plan={plan}
                    isActive={plan.type === user?.subscription_type}
                    isDisbaled={
                      isSubscribing ||
                      user?.subscription_type === 'subscription'
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <SubscriptionInfo
            plan={user?.subscription_type || 'Free'}
            startDate={
              userSubscriptions?.slice(-1)[0]?.start_date
                ? formatDate(userSubscriptions?.slice(-1)[0]?.start_date)
                : 'N/A'
            }
            renewalDate={
              userSubscriptions?.slice(-1)[0]?.current_period_end
                ? formatDate(
                    userSubscriptions?.slice(-1)[0]?.current_period_end
                  )
                : 'N/A'
            }
            autoRenew={autoRenew}
            onAutoRenewChange={handleAutoRenewChange.mutate}
          />

          <PaymentMethod
            stripeCustomer={stripeCustomer}
            refetchCustomer={refetchCustomer}
            cards={paymentCards}
            onCardAdded={handleAddCard}
            onCardUpdated={handleUpdateCard}
            onCardRemoved={handleRemoveCard}
            isLoading={cardsLoading}
          />
        </div>
      </Elements>
    </div>
  );
}
