'use client';

import LoadingSpinner from '@/components/common/loading-spinner';
import { ActivityTable } from '@/components/dashboard/activity-table/activity-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { DonutChart } from '@/components/dashboard/donut-chart';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TokenChart } from '@/components/dashboard/token-chart';
import useUserData from '@/hooks/useUserData';

const mockActivities = [
  { serialNo: 1, requestedAt: '10/2/2024 4:45:52 AM', activityType: 'Document Upload', tokensDeducted: 50 },
  { serialNo: 2, requestedAt: '10/1/2024 4:45:52 AM', activityType: 'Query Mode', tokensDeducted: 100 },
  { serialNo: 3, requestedAt: '9/27/2024 4:45:52 AM', activityType: 'Document Upload', tokensDeducted: 80 },
  { serialNo: 4, requestedAt: '9/25/2024 4:45:52 AM', activityType: 'Document Upload', tokensDeducted: 100 },
  { serialNo: 5, requestedAt: '9/23/2024 4:45:52 AM', activityType: 'Query Mode', tokensDeducted: 150 },
  { serialNo: 6, requestedAt: '9/23/2024 4:45:52 AM', activityType: 'Query Mode', tokensDeducted: 80 },
  { serialNo: 7, requestedAt: '9/23/2024 4:45:52 AM', activityType: 'Document Upload', tokensDeducted: 90 },
];

const mockTrendData = Array.from({ length: 10 }, (_, i) => ({
  date: `${i + 1} am`,
  value: Math.floor(Math.random() * 60) + 30,
}));

export default function DashboardPage() {
  const { data: user, isLoading, error } = useUserData();

  if (isLoading) return <LoadingSpinner />;

  if (error) return <p className="text-red-500 text-center mt-5">Error: {error.message}</p>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-6 py-8">
      <DashboardHeader title="Dashboard" />
      <div className="flex flex-col items-center justify-center flex-1 w-full mt-2 gap-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          <MetricCard title="Total Tokens" value={user?.tokens || 500} type="total" />
          <MetricCard title="Used Tokens" value={user?.total_credits_used||0} type="used" />
          <MetricCard title="Remaining Tokens" value={(user?.tokens || 0) - (user?.total_credits_used || 0)} type="remaining" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 w-full">
          <DonutChart used={user?.total_credits_used || 0} remaining={(user?.tokens || 0) - (user?.total_credits_used || 0)} total={user?.tokens || 0} />
          <TokenChart data={mockTrendData} />
        </div>
        <div className="w-full overflow-x-auto">
          <ActivityTable activities={mockActivities} showActions={false} />
        </div>
      </div>
    </div>
  );
}
