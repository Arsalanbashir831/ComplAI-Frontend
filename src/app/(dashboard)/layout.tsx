'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';

import apiCaller from '@/config/apiCaller';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

type RequestData =
  | FormData
  | {
      subscription_plan_id?: number;
      product_id?: number;
    };

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const subscription = searchParams.get('subscription');

  useEffect(() => {
    if (!subscription) return;

    const handleSubscription = async () => {
      let endpoint: string;
      let payload: RequestData = {};
      if (subscription === 'monthly') {
        endpoint = API_ROUTES.BILLING.MONTHLY_BILLING_PROCESS;
        payload = { subscription_plan_id: 2 };
      } else if (subscription === 'topup') {
        endpoint = API_ROUTES.BILLING.ONE_TIME_PAYMENT_BILLING_PROCESS;
        payload = { product_id: 2 };
      } else {
        console.warn('Unknown subscription type:', subscription);
        return;
      }

      try {
        const response = await apiCaller(
          endpoint,
          'POST',
          payload, // body
          {}, // headers
          true, // useAuth
          'json'
        );
        console.log('Subscription API response:', response.data);
        window.location.href = response.data.checkout_url;
        // // e.g. save in localStorage if you need:
        // localStorage.setItem('subscription', subscription);
      } catch (err) {
        console.error('Failed to handle subscription:', err);
      }
    };

    handleSubscription();
  }, [subscription]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-[#F9F9FC]">{children}</main>
    </div>
  );
}
