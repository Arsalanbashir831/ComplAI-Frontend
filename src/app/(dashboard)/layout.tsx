'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { useSubscription } from '@/hooks/useSubscription';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const subscription = searchParams.get('subscription');
  const { handleSubscription } = useSubscription();
  useEffect(() => {
    if (!subscription) return;
    if (subscription === 'monthly') {
      handleSubscription('monthly');
    } else if (subscription === 'topup') {
      handleSubscription('topup');
    }
  }, [subscription, handleSubscription]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-[#F9F9FC]">{children}</main>
    </div>
  );
}
