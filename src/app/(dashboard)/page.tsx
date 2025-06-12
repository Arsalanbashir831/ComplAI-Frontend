'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';

import apiCaller from '@/config/apiCaller';
import { ActivityTable } from '@/components/dashboard/activity-table/activity-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { DonutChart } from '@/components/dashboard/donut-chart';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TokenChart } from '@/components/dashboard/token-chart';

type TokensSummary = {
  remaining_tokens: number;
  used_tokens: number;
  total_tokens: number;
};

export default function DashboardPage() {
  const fetchTokensSummary = async (): Promise<TokensSummary> => {
    const response = await apiCaller(
      API_ROUTES.USER.GET_TOKENS_SUMMARY,
      'GET',
      {},
      {},
      true,
      'json'
    );
    return response.data;
  };

  const {
    data: tokensSummary,
    isLoading: isLoadingTokensSummary,
    error: tokensSummaryError,
  } = useQuery({
    queryKey: ['tokensSummary'],
    queryFn: fetchTokensSummary,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

    if (isLoadingTokensSummary) {
        return (
            <div className="animate-pulse min-h-screen w-full flex flex-col items-center px-6 py-8">
                <DashboardHeader title="Dashboard" />

                <div className="flex flex-col items-center justify-center flex-1 w-full mt-2 gap-8">
                    {/* Metric cards skeleton */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-24 bg-gray-200 rounded-lg"
                            />
                        ))}
                    </div>

                    {/* Charts skeleton */}
                    <div className="grid gap-6 md:grid-cols-2 w-full">
                        <div className="h-80 bg-gray-200 rounded-lg" />
                        <div className="h-80 bg-gray-200 rounded-lg" />
                    </div>

                    {/* Activity table skeleton */}
                    <div className="w-full overflow-x-auto">
                        <div className="h-48 bg-gray-200 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

  if (tokensSummaryError)
    return (
      <p className="text-red-500 text-center mt-5">
        Error: {tokensSummaryError?.message}
      </p>
    );

  // Ensure tokens are non-negative
  const totalTokens = Math.max(
    Number(((tokensSummary?.total_tokens ?? 0) / 1000).toFixed(0)),
    0
  );
  const usedTokens = Math.max(
    Number(((tokensSummary?.used_tokens ?? 0) / 1000).toFixed(0)),
    0
  );
  const remainingTokens = Math.max(
    Number(((tokensSummary?.remaining_tokens ?? 0) / 1000).toFixed(0)),
    0
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-6 py-8">
      <DashboardHeader title="Dashboard" />
      <div className="flex flex-col items-center justify-center flex-1 w-full mt-2 gap-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          <MetricCard title="Total Credits" value={totalTokens} type="total" />
          <MetricCard title="Used Credits" value={usedTokens} type="used" />
          <MetricCard
            title="Remaining Credits"
            value={remainingTokens}
            type="remaining"
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2 w-full">
          <DonutChart
            used={usedTokens}
            remaining={remainingTokens}
            total={totalTokens}
          />
          <TokenChart />
        </div>
        <div className="w-full overflow-x-auto">
          <ActivityTable showActions={false} />
        </div>
      </div>
    </div>
  );
}
