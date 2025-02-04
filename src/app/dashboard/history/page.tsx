import { ActivityTable } from '@/components/dashboard/activity-table/activity-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';

const mockActivities = [
  {
    serialNo: 1,
    requestedAt: '10/2/2024 4:45:52 AM',
    activityType: 'Document Upload',
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
    activityType: 'Document Upload',
    tokensDeducted: 80,
  },
  {
    serialNo: 4,
    requestedAt: '9/25/2024 4:45:52 AM',
    activityType: 'Document Upload',
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
    activityType: 'Document Upload',
    tokensDeducted: 90,
  },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      {/* Header Stays at the Top */}
      <DashboardHeader
        title="Interaction History"
        subtitle="Here you can view your interaction history"
      />

      {/* Centered Content */}
      <div className="flex flex-col justify-center flex-1 w-full    rounded-xl p-6 space-y-6">
        <ActivityTable
          activities={mockActivities}
          pageSize={7}
          showTitle={false}
        />
      </div>
    </div>
  );
}
