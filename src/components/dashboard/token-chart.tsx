'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { DateRangePicker } from '../common/date-range-picker';

interface TokenChartProps {
  data: { date: string; value: number }[];
}

export function TokenChart({ data }: TokenChartProps) {
  return (
    <Card className="rounded-lg shadow-md border-none w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-[#030229]">Token Usage Trend</CardTitle>

        <DateRangePicker value={undefined} onChange={() => {}} />
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
                dataKey="date"
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
                dataKey="value"
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
