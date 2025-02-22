'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import type { DateRange } from 'react-day-picker';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import apiCaller from '@/config/apiCaller';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { DateRangePicker } from '../common/date-range-picker';
import LoadingSpinner from '../common/loading-spinner';

interface TokenHistoryProps {
  data: { usage_date: string; tokens_used: number }[];
}

// Function to get the default date range (one month before today)
const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return { from: oneMonthAgo, to: today };
};

export function TokenChart() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const fetchHistory = async (): Promise<TokenHistoryProps> => {
    if (!dateRange?.from || !dateRange?.to) return { data: [] };

    const queryParams = `?start_date=${
      dateRange.from.toISOString().split('T')[0]
    }&end_date=${dateRange.to.toISOString().split('T')[0]}`;

    const response = await apiCaller(
      `${API_ROUTES.USER.GET_TOKENS_HISTORY}${queryParams}`,
      'GET',
      {},
      {},
      true,
      'json'
    );
    return response.data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['history', dateRange],
    queryFn: fetchHistory,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  // Refetch data when component mounts (ensures initial date range is used)
  useEffect(() => {
    refetch();
  }, [dateRange, refetch]);

  if (isLoading) return <LoadingSpinner />;

  if (error)
    return (
      <p className="text-red-500 text-center mt-5">Error: {error?.message}</p>
    );

  return (
    <Card className="rounded-lg shadow-md border-none w-full">
      <CardHeader className="md:flex-row md:items-center justify-between gap-2">
        <CardTitle className="text-[#030229]">Token Usage Trend</CardTitle>

        <DateRangePicker
          value={dateRange}
          onChange={(newRange) => newRange && setDateRange(newRange)}
          className="self-end"
        />
      </CardHeader>
      <CardContent className="px-2 sm:px-4 md:px-6">
        <ResponsiveContainer width="100%" height={350}>
          <ChartContainer
            config={{
              tokens: {
                label: 'Tokens',
                color: 'hsl(var(--chart-1))',
              },
            }}
          >
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="usage_date"
                tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Line
                type="monotone"
                dataKey="tokens_used"
                strokeWidth={2}
                stroke="var(--color-tokens)"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
