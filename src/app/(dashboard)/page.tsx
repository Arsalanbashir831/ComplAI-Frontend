'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ActivityTable } from '@/components/dashboard/activity-table/activity-table';
import { DonutChart } from '@/components/dashboard/donut-chart';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TokenChart } from '@/components/dashboard/token-chart';
import apiCaller from '@/config/apiCaller';

type TokensSummary = {
  remaining_tokens: number;
  used_tokens: number;
  total_tokens: number;
};

export default function DashboardPage() {
  const queryClient = useQueryClient();

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

  // Auto-refresh when component mounts
  useEffect(() => {
    const refreshOnMount = async () => {
      try {
        // Invalidate stale queries to ensure fresh data
        await queryClient.invalidateQueries({ queryKey: ['tokensSummary'] });
        await queryClient.invalidateQueries({ queryKey: ['history'] });
        await queryClient.invalidateQueries({ queryKey: ['user'] });
      } catch (error) {
        console.error('Error refreshing on mount:', error);
      }
    };

    refreshOnMount();
  }, [queryClient]);

  if (isLoadingTokensSummary) {
    return (
      <div className="animate-pulse min-h-screen w-full flex flex-col items-center px-6 py-8">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center justify-center gap-5 ml-4 md:ml-0">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl md:text-3xl font-bold">Dashboard</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 w-full mt-2 gap-8">
          {/* Metric cards skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
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
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center justify-center gap-5 ml-4 md:ml-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-3xl font-bold">Dashboard</h1>
          </div>
        </div>
      </div>
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
