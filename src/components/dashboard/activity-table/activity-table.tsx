'use client';

import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { DateRangePicker } from '@/components/common/date-range-picker';
import LoadingSpinner from '@/components/common/loading-spinner';
import { UserQueryModal } from '@/components/dashboard/activity-table/user-quey-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useTokensHistory from '@/hooks/useTokensHistory';
import { cn, getDefaultDateRange } from '@/lib/utils';
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
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const { data, isLoading, error, refetch } = useTokensHistory(dateRange);

  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refetch();
  }, [dateRange, activeTab, refetch]);

  if (isLoading) return <LoadingSpinner />;

  if (error) return <div>Error loading data</div>;

  // Filter data based on the selected date range
  const filteredData = Array.isArray(data)
    ? data.filter((curr) => {
        const usageDate = new Date(curr.usage_date);
        const startDate = new Date(dateRange.from ?? new Date());
        const endDate = new Date(dateRange.to ?? new Date());
        return usageDate >= startDate && usageDate <= endDate;
      })
    : [];

  // Filter based on the active tab (query or document)
  const tabFilteredData = filteredData.filter((curr) => {
    if (activeTab === 'query') {
      return curr.activity_type === 'query';
    } else if (activeTab === 'document') {
      return curr.activity_type === 'document';
    }
    return true; // 'all' tab, show all
  });

  // Modal state (using previously declared state)

  // Handle "View" button
  const handleView = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

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
            <DateRangePicker
              value={dateRange}
              onChange={(newRange) => newRange && setDateRange(newRange)}
            />
            <Tabs
              defaultValue="all"
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="bg-white border border-[#E0E2E7]">
                <TabsTrigger
                  value="query"
                  className="text-[#667085] data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
                >
                  Query Mode
                </TabsTrigger>
                <TabsTrigger
                  value="document"
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
          <DataTable<ActivityItem, unknown>
            columns={createColumns(showActions, handleView)}
            data={tabFilteredData} // Pass filtered and tab-specific data
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
