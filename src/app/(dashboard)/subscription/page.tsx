'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useUserContext } from '@/contexts/user-context';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { Plan, Subscription } from '@/types/subscription';
import apiCaller from '@/config/apiCaller';
import { formatDateLocal } from '@/lib/utils';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { PricingCard } from '@/components/dashboard/subscription/pricing-card';
import { SubscriptionInfo } from '@/components/dashboard/subscription/subscription-info';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

// Fetch payment cards
// const fetchPaymentCards = async (): Promise<PaymentCard[]> => {
//   const response = await apiCaller(
//     API_ROUTES.BILLING.LIST_CARDS,
//     'GET',
//     {},
//     {},
//     true,
//     'json'
//   );
//   return response.data.cards.map(
//     (card: {
//       id: string;
//       card: { funding: string; brand: string; last4: string };
//     }) => ({
//       id: card.id,
//       type: card.card.funding, // "credit" or "debit"
//       brand: card.card.brand,
//       lastFour: card.card.last4, // rename last4 to lastFour
//       isDefault: false,
//     })
//   );
// };

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
      id: product.id,
      type: 'free',
      title: product.name,
      price: `£${(product.price / 100).toFixed(0)}`,
      description: [
        { text: ' Buy credits as needed, with a minimum top-up of £50.' },
        {
          text: 'Access to Companion, your AI-powered compliance expert.',
        },
        { text: 'Basic email support for general assistance.' },
        {
          text: 'Suitable for occasional users who require flexible, pay-as-you-go access.',
        },
      ],
      buttonText: 'Purchase Tokens',
      special: false,
      buttonAction: () => {},
    });
  }

  if (subscription_plans && subscription_plans.length > 0) {
    const subPlan = subscription_plans[0];
    plansArray.push({
      id: subPlan.id,
      type: 'subscription',
      title: subPlan.name,
      price: `£${(subPlan.price / 100).toFixed(0)}`,
      interval: subPlan.interval,
      description: [
        { text: '500 credits per month with no rollover.' },
        {
          text: 'Access to Resolve, our AI-powered tool for efficient complaint handling.',
        },
        {
          text: 'File upload feature on Companion for documents up to 5MB.',
        },
        {
          text: 'Priority email support for quicker assistance when you need it.',
        },
        {
          text: 'Suitable for regular users who need consistent and reliable AI support.',
        },
      ],
      buttonText: 'Subscribe',
      special: true,
      buttonAction: () => {},
    });
  }

  plansArray.push({
    id: 2,
    type: 'enterprise',
    title: 'Enterprise',
    price: '£POA',
    minimumTerm: '24 Months',
    description: [
      {
        text: 'Access all solutions with unlimited usage across the platform ',
      },
      {
        text: 'File upload on Companion for documents up to 30MB',
      },
      {
        text: 'Dedicated account manager to support your team and ensure success',
      },
      {
        text: 'Exclusive demos and walkthroughs for every solution to maximise value.',
      },
      {
        text: 'Ideal for teams and professionals who require comprehensive access and support.',
      },
    ],
    buttonText: 'Contact Sales',
    special: false,
    buttonAction: () => {},
  });

  return plansArray;
};

// Fetch the stripe customer info, which includes the default card ID
// const fetchStripeCustomer = async (): Promise<{
//   default_payment_method: string;
// }> => {
//   const response = await apiCaller(
//     API_ROUTES.BILLING.STRIPE_CUSTOMER,
//     'GET',
//     {},
//     {},
//     true,
//     'json'
//   );
//   return response.data;
// };

async function fetchUserSubscriptions(): Promise<Subscription[]> {
  const response = await apiCaller(
    API_ROUTES.BILLING.USER_SUBSCRIPTIONS,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
}

export default function SubscriptionPage() {
  const { user, refresh } = useUserContext();
  // const queryClient = useQueryClient();
  // const isSubscribing = useIsMutating() > 0;
  const [autoRenew, setAutoRenew] = useState(true);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // const { data: paymentCards = [], isLoading: cardsLoading } = useQuery<
  //   PaymentCard[]
  // >({
  //   queryKey: ['paymentCards'],
  //   queryFn: fetchPaymentCards,
  //   staleTime: 1000 * 60 * 5,
  // });

  const { data: fetchedPlans = [], isLoading: plansLoading } = useQuery<Plan[]>(
    {
      queryKey: ['subscriptionItems'],
      queryFn: fetchSubscriptionItems,
      staleTime: 1000 * 60 * 5,
    }
  );

  // Query to fetch the stripe customer info
  // const { data: stripeCustomer, } = useQuery({
  //   queryKey: ['stripeCustomer'],
  //   queryFn: fetchStripeCustomer,
  //   staleTime: 1000 * 60 * 5,
  // });

  // New query to fetch user subscriptions data
  const {
    data: userSubscriptions,
    isLoading: subscriptionsLoading,
    // refetch,
  } = useQuery({
    queryKey: ['userSubscriptions'],
    queryFn: fetchUserSubscriptions,
    staleTime: 1000 * 60 * 5,
  });

  // Log the subscriptions data when it becomes available (only on client)
  useEffect(() => {
    if (userSubscriptions && typeof window !== 'undefined') {
      console.log('User Subscriptions:', userSubscriptions);
      // refetch();
    }
  }, [userSubscriptions]);

  // const purchaseTokensMutation = useMutation({
  //   mutationFn: async (productId: number) => {
  //     let paymentMethodId: string | undefined;
  //     const defaultCard = paymentCards.find((card) => card.isDefault);
  //     if (defaultCard) {
  //       paymentMethodId = defaultCard.id;
  //     } else if (paymentCards.length > 0) {
  //       paymentMethodId = paymentCards[0].id;
  //     }
  //     if (!paymentMethodId) {
  //       throw new Error(
  //         'Please add a payment method before purchasing tokens.'
  //       );
  //     }
  //     const response = await apiCaller(
  //       API_ROUTES.BILLING.CREATE_ONE_TIME_PAYMENT_INTENT,
  //       'POST',
  //       { product_id: productId, payment_method_id: paymentMethodId },
  //       {},
  //       true,
  //       'json'
  //     );
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     refresh();
  //     toast.success('Token purchase successful!');
  //   },
  //   onError: () => {
  //     toast.error('Token purchase failed, please try again.');
  //   },
  // });

  const subscribeMutation = useMutation({
    mutationFn: async (subscriptionPlanId: number) => {
      // const paymentMethodId = stripeCustomer?.default_payment_method;
      // if (!paymentMethodId) {
      //   throw new Error('Please add a payment method before subscribing.');
      // }
      const response = await apiCaller(
        API_ROUTES.BILLING.MONTHLY_BILLING_PROCESS,
        'POST',
        {
          subscription_plan_id: subscriptionPlanId,
        },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: (response) => {
      window.location.href = response.checkout_url;
      // refresh();
      // toast.success('Subscription successful!');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Subscription failed, please try again.'
      );
    },
  });

  const OneTimePaymentMutation = useMutation({
    mutationFn: async (planId: number) => {
      // const paymentMethodId = stripeCustomer?.default_payment_method;
      // if (!paymentMethodId) {
      //   throw new Error('Please add a payment method before subscribing.');
      // }
      const response = await apiCaller(
        API_ROUTES.BILLING.ONE_TIME_PAYMENT_BILLING_PROCESS,
        'POST',
        {
          product_id: planId,
        },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: (response) => {
      window.location.href = response.checkout_url;
      // refresh();
      // toast.success('Subscription successful!');
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
    console.log(plan.id);
    if (plan.type === 'free') {
      return {
        ...plan,
        buttonAction: () => OneTimePaymentMutation.mutate(plan.id),
      };
    } else if (plan.type === 'subscription') {
      return {
        ...plan,
        buttonAction: () => subscribeMutation.mutate(plan.id),
      };
    } else {
      return {
        ...plan,
        buttonAction: () => {
          window.open(
            `${process.env.NEXT_PUBLIC_LANDING_URL}/contact`,
            '_blank',
            'noopener,noreferrer'
          );
        },
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
      refresh();
    },
    onError: () => {
      toast.error('Unable to disable renew until the Contract Period is over');
    },
  });

  // const handleAddCard = () => {
  //   queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
  // };

  // const handleUpdateCard = () => {
  //   queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
  // };

  // const handleRemoveCard = () => {
  //   queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
  // };

  const isLoading = plansLoading || subscriptionsLoading;

  // Early-return a full-screen skeleton overlay:
  if (isLoading) {
    return (
      <div className="h-screen bg-white px-6 py-10 animate-pulse">
        {/* Header skeleton */}
        <div className="h-8 w-1/4 bg-gray-200 rounded mb-8" />

        {/* Subscription Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 p-4 rounded-xl h-[620px] flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                {/* Title */}

                {/* Main Box (simulate card body) */}
                <div className="h-62 bg-gray-200 rounded" />
                {/* 2–3 description lines */}
              </div>
            </div>
          ))}
        </div>

        {/* Current Subscription Section Skeleton */}
        <div className="mt-12 max-w-4xl mx-auto border-t border-gray-100 pt-8 space-y-4 animate-pulse">
          <div className="h-6 w-2/5 bg-gray-200 rounded" />
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-12 bg-gray-300 rounded-full" />
          </div>
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      <DashboardHeader title="Subscription" />

      <Elements stripe={stripePromise}>
        <div className="flex flex-col justify-center flex-1 w-full bg-white rounded-xl p-8 space-y-8 mt-3">
          <div>
            {/* <h1 className="text-2xl font-semibold mb-6">Plans</h1> */}
            {
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plansWithActions.map((plan) => (
                  <PricingCard
                    key={plan.type}
                    plan={plan}
                    isActive={plan.type === user?.subscription_type}
                    isDisabled={plan.type === user?.subscription_type}
                  />
                ))}
              </div>
            }
          </div>

          <SubscriptionInfo
            plan={user?.subscription_type || 'Free'}
            startDate={
              userSubscriptions?.slice(-1)[0]?.start_date
                ? formatDateLocal(userSubscriptions.slice(-1)[0].start_date)
                : 'N/A'
            }
            renewalDate={
              userSubscriptions?.slice(-1)[0]?.start_date
                ? formatDateLocal(
                    new Date(
                      userSubscriptions.slice(-1)[0].start_date
                    ).setFullYear(
                      new Date(
                        userSubscriptions.slice(-1)[0].start_date
                      ).getFullYear() + 1
                    ) as unknown as string
                  )
                : 'N/A'
            }
            autoRenew={autoRenew && user?.subscription_type === 'subscription'}
            onAutoRenewChange={handleAutoRenewChange.mutate}
          />
          {/* <PaymentMethod
            stripeCustomer={stripeCustomer}
            refetchCustomer={refetchCustomer}
            cards={paymentCards}
            onCardAdded={handleAddCard}
            onCardUpdated={handleUpdateCard}
            onCardRemoved={handleRemoveCard}
            isLoading={cardsLoading}
          /> */}
        </div>
      </Elements>
    </div>
  );
}
