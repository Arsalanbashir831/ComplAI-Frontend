import { ActivityTable } from '@/components/dashboard/activity-table/activity-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { DonutChart } from '@/components/dashboard/donut-chart';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TokenChart } from '@/components/dashboard/token-chart';

const mockActivities = [
  {
    serialNo: 1,
    requestedAt: '10/2/2024 4:45:52 AM',
    activityType: 'Uploaded Document',
    tokensDeducted: 50,
  },
  {
    serialNo: 2,
    requestedAt: '10/1/2024 4:45:52 AM',
    activityType: 'Query Mode',
    tokensDeducted: 100,
  },
  {
    serialNo: 3,
    requestedAt: '9/27/2024 4:45:52 AM',
    activityType: 'Uploaded Document',
    tokensDeducted: 80,
  },
  {
    serialNo: 4,
    requestedAt: '9/25/2024 4:45:52 AM',
    activityType: 'Uploaded Document',
    tokensDeducted: 100,
  },
  {
    serialNo: 5,
    requestedAt: '9/23/2024 4:45:52 AM',
    activityType: 'Query Mode',
    tokensDeducted: 150,
  },
  {
    serialNo: 6,
    requestedAt: '9/23/2024 4:45:52 AM',
    activityType: 'Query Mode',
    tokensDeducted: 80,
  },
  {
    serialNo: 7,
    requestedAt: '9/23/2024 4:45:52 AM',
    activityType: 'Uploaded Document',
    tokensDeducted: 90,
  },
];

const mockTrendData = Array.from({ length: 10 }, (_, i) => ({
  date: `${i + 1} am`,
  value: Math.floor(Math.random() * 60) + 30,
}));

export default function DashboardPage() {
  return (

    <div className="min-h-screen w-full flex flex-col items-center px-6 py-8">
      {/* Dashboard Header - Stays at the Top */}
      <DashboardHeader title="Dashboard" />

      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center flex-1 w-full mt-2 gap-8">
        {/* Metric Cards - Centered */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full ">
          <MetricCard title="Total Tokens" value={500} type="total" />
          <MetricCard title="Used Tokens" value={150} type="used" />
          <MetricCard title="Remaining Tokens" value={350} type="remaining" />
        </div>

        {/* Charts Section - Centered */}
        <div className="grid gap-6 md:grid-cols-2 w-full ">
          <DonutChart used={150} remaining={350} />
          <TokenChart data={mockTrendData} />
        </div>

        {/* Activity Table - Centered & Scrollable */}
        <div className="w-full  overflow-x-auto">
          <ActivityTable activities={mockActivities} showActions={false} />
        </div>
      </div>

    </div>
  );
}
