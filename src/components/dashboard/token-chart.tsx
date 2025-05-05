// components/dashboard/token-chart.tsx
'use client';

import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import useTokensHistory from '@/hooks/useTokensHistory';
import { getDefaultDateRange } from '@/lib/utils';

import { DateRangePicker } from '../common/date-range-picker';
import LoadingSpinner from '../common/loading-spinner';

type AggregatedData = {
  usage_date: string;
  tokens: number;
};

export function TokenChart() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const { data, isLoading, error, refetch } = useTokensHistory(dateRange);

  useEffect(() => {
    refetch();
  }, [dateRange, refetch]);

  // waiting state
  if (isLoading) return <LoadingSpinner />;
  if (error)     return <div>Error loading data</div>;

  // filter and aggregate
  const filtered = Array.isArray(data)
    ? data.filter((d) => {
        const usage = new Date(d.usage_date);
        return (
          usage >= new Date(dateRange.from!) &&
          usage <= new Date(dateRange.to!)
        );
      })
    : [];

  const aggregated: AggregatedData[] = filtered.reduce((acc, curr) => {
    const d = new Date(curr.usage_date);
    const key = `${d.getDate().toString().padStart(2,'0')}-${(
      d.getMonth()+1
    ).toString().padStart(2,'0')}-${d.getFullYear()}`;
    const existing = acc.find((e:AggregatedData) => e.usage_date === key);
    if (existing) {
      existing.tokens += curr.tokens_used;
    } else {
      acc.push({ usage_date: key, tokens: curr.tokens_used });
    }
    return acc;
  }, [] as AggregatedData[])
    .filter((e:AggregatedData) => !isNaN(e.tokens));

  // safe domain
  const yDomain: [number, 'dataMax'] = [0, 'dataMax'];

  return (
    <Card className="rounded-lg shadow-md border-none w-full">
      <CardHeader className="md:flex-row md:items-center justify-between gap-2">
        <CardTitle className="text-[#030229]">Credit Usage Trend</CardTitle>
        <DateRangePicker
          value={dateRange}
          onChange={(nr) => nr && setDateRange(nr)}
          className="self-end"
        />
      </CardHeader>

      <CardContent className="px-2 sm:px-4 md:px-6">
        {aggregated.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500">
            No usage data for the selected range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ChartContainer
              config={{
                tokens: { label: 'Credits', color: 'hsl(var(--chart-1))' },
              }}
            >
              <BarChart
                data={aggregated}
                margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
              >
                <XAxis
                  dataKey="usage_date"
                  angle={-45}
                  textAnchor="end"
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <YAxis
                  domain={yDomain}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <Bar
                  dataKey="tokens"
                  barSize={80}
                  radius={[4, 4, 0, 0]}
                  fill="hsl(var(--chart-1))"
                />
                <Tooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
