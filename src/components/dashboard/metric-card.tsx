import { Box } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: number;
  type: 'total' | 'used' | 'remaining';
}

const typeStyles = {
  total: 'text-blue-500 bg-blue-50',
  used: 'text-orange-500 bg-orange-50',
  remaining: 'text-emerald-500 bg-emerald-50',
};

export function MetricCard({ title, value, type }: MetricCardProps) {
  return (
    <Card className="rounded-lg shadow-md border-none relative">
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-opacity-25 rounded-lg ${typeStyles[type]}`}
      />
      <CardContent className="py-6 px-8">
        <div className="flex items-center space-x-6">
          <div className={`p-4 rounded-full ${typeStyles[type]}`}>
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
