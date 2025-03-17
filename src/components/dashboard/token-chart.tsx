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

import { getDefaultDateRange } from '@/lib/utils';
import useTokensHistory from '@/hooks/useTokensHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

import { DateRangePicker } from '../common/date-range-picker';
import LoadingSpinner from '../common/loading-spinner';

type AggregatedData = {
  usage_date: string;
  tokens_used: number;
};

export function TokenChart() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const { data, isLoading, error, refetch } = useTokensHistory(dateRange);

  // Refetch data when component mounts (ensures initial date range is used)
  useEffect(() => {
    refetch();
  }, [dateRange, refetch]);

  if (isLoading) return <LoadingSpinner />;

  if (error) return <div>Error loading data</div>;

  // Filter data based on selected date range (frontend filtering)
  const filteredData = Array.isArray(data)
    ? data.filter((curr) => {
        const usageDate = new Date(curr.usage_date);
        const startDate = new Date(dateRange.from!);
        const endDate = new Date(dateRange.to!);
        return usageDate >= startDate && usageDate <= endDate;
      })
    : [];

  // Aggregate token usage by date
  const aggregatedData = filteredData.reduce((acc: AggregatedData[], curr) => {
    // Extract the date part from the usage_date string (YYYY-MM-DD)
    const usageDate = new Date(curr.usage_date);
    const formattedDate = `${usageDate.getDate().toString().padStart(2, '0')}-${(usageDate.getMonth() + 1).toString().padStart(2, '0')}-${usageDate.getFullYear()}`;

    // Find the index of an existing entry for the current date
    const existingEntry = acc.find(
      (entry) => entry.usage_date === formattedDate
    );

    if (existingEntry) {
      // If the date already exists, accumulate the tokens_used
      existingEntry.tokens_used += curr.tokens_used;
    } else {
      // Otherwise, add a new entry with the tokens_used for that date
      acc.push({ usage_date: formattedDate, tokens_used: curr.tokens_used });
    }

    return acc;
  }, []);

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
            <BarChart
              data={aggregatedData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 40, // Increased margin on bottom to avoid cutting off X-axis labels
              }}
            >
              <XAxis
                dataKey="usage_date"
                tickFormatter={(tick) => tick} // Since the date is already formatted
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45} // Rotate the labels if necessary to fit them
                textAnchor="end" // Adjust the alignment of the labels
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Bar
                dataKey="tokens_used"
                fill="var(--color-tokens)"
                barSize={80} // Adjust the bar size here for more spacing
              />
              <Tooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
