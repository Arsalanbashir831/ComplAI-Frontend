'use client';

import { useSearchParams } from 'next/navigation';

import DashboardHeader from '@/components/dashboard/dashboard-header';
import ProfileForm from '@/components/dashboard/profile/profile-form';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      {/* Header Stays at the Top */}
      <DashboardHeader title="My Profile" />

      {/* Centered Content */}
      <div className="flex flex-col justify-center flex-1 w-full rounded-xl p-6 space-y-6">
        <ProfileForm type={type ?? undefined} />
      </div>
    </div>
  );
}
