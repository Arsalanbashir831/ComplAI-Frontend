import { ActivityTable } from '@/components/dashboard/activity-table/activity-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      {/* Header Stays at the Top */}
      <DashboardHeader
        title="Interaction History"
        subtitle="Here you can view your interaction history"
      />

      {/* Centered Content */}
      <div className="flex flex-col justify-center flex-1 w-full    rounded-xl ">
        <ActivityTable pageSize={7} showTitle={false} />
      </div>
    </div>
  );
}
