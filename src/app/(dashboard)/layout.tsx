'use client';

import React, { Suspense, useEffect } from 'react';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { ProfileCompletionBanner } from '@/components/dashboard/profile-completion-banner';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  // Clean up userEmail from localStorage when dashboard is accessed
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      localStorage.removeItem('userEmail');
    }
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-[#F9F9FC]">
        <ProfileCompletionBanner />
        {children}
      </main>
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
