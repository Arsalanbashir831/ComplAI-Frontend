'use client';

import { Label, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface DonutChartProps {
  used: number;
  remaining: number;
  total: number;
}

export function DonutChart({ used, remaining }: DonutChartProps) {
  const data = [
    { name: 'Remaining', value: remaining, fill: 'var(--color-used)' },
    { name: 'Used', value: used, fill: 'var(--color-remaining)' },
  ];

  return (
    <Card className="rounded-lg shadow-md border-none md:max-w-none">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-[#030229]">Credits Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center px-4">
        <div className="h-60 w-60 md:h-80 md:w-80">
          <ResponsiveContainer>
            <ChartContainer
              config={{
                used: {
                  label: 'Used Tokens',
                  color: 'hsl(var(--chart-1))',
                },
                remaining: {
                  label: 'Remaining Tokens',
                  color: 'hsl(var(--chart-2))',
                },
              }}
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data}
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="top"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-xl md:text-3xl font-bold"
                            >
                              {remaining}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs md:text-sm"
                            >
                              Remaining Credits
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-4 flex-wrap">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    index === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))',
                }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
