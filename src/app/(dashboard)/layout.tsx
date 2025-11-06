'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { useSubscription } from '@/hooks/useSubscription';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
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

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}

function DashboardLayoutFallback() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="w-64 bg-gray-100 animate-pulse" />
      <main className="flex-1 overflow-auto bg-[#F9F9FC]">
        <div className="h-full bg-gray-50 animate-pulse" />
      </main>
    </div>
  );
}
