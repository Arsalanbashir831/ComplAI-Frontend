'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { DateRangePicker } from '@/components/common/date-range-picker';
import LoadingSpinner from '@/components/common/loading-spinner';
import { UserQueryModal } from '@/components/dashboard/activity-table/user-quey-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiCaller from '@/config/apiCaller';
import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/types/dashboard';

import { DataTable } from '../../common/data-table';
import { createColumns } from './columns';

interface ActivityTableProps {
  pageSize?: number;
  showTitle?: boolean;
  showActions?: boolean;
}

export function ActivityTable({
  pageSize,
  showTitle = true,
  showActions = true,
}: ActivityTableProps) {
  const [activeTab, setActiveTab] = useState('all');

  // Modal state
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle "View" button
  const handleView = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const fetchHistory = async (): Promise<ActivityItem> => {
    const response = await apiCaller(
      API_ROUTES.CHAT.GET_INTERACTION_HISTORY,
      'GET',
      {},
      {},
      true,
      'json'
    );
    return response.data;
  };

  const {
    data: activities,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (isLoading) return <LoadingSpinner />;

  if (error)
    return (
      <p className="text-red-500 text-center mt-5">Error: {error?.message}</p>
    );

  return (
    <>
      <Card className="rounded-lg shadow-md border-none">
        <CardHeader
          className={cn(
            'flex md:flex-row md:items-center gap-4',
            showTitle ? 'justify-between' : 'justify-end'
          )}
        >
          {showTitle && (
            <CardTitle className="flex items-center gap-2 text-[#1D1F2C]">
              Recent Activity
              <Badge className="bg-[#E9FAF7] text-[#09B975]">17</Badge>
            </CardTitle>
          )}

          <div className="flex flex-col items-start md:flex-row md:items-center gap-4">
            <DateRangePicker value={undefined} onChange={() => {}} />
            <Tabs
              defaultValue="all"
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="bg-white border border-[#E0E2E7]">
                <TabsTrigger
                  value="Query Mode"
                  className="text-[#667085] data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
                >
                  Query Mode
                </TabsTrigger>
                <TabsTrigger
                  value="Document Upload"
                  className="text-[#667085] data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
                >
                  Document Upload
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="text-[#667085] data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={createColumns(showActions, handleView)}
            data={activities || []}
            activeFilter={activeTab}
            pageSize={pageSize}
            isTabsPresent={true}
          />
        </CardContent>
      </Card>

      {/* Modal (appears when user clicks View) */}
      <UserQueryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
      />
    </>
  );
}
