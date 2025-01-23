import { ActivityTable } from '@/components/dashboard/activity-table/activity-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';

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

export default function HistoryPage() {
  return (
    <div className="p-6 space-y-6 bg-[#F9F9FC]">
      <DashboardHeader title="Compliance History" />

      <ActivityTable
        activities={mockActivities}
        pageSize={7}
        showTitle={false}
      />
    </div>
  );
}
