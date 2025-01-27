'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { ActivityItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/common/date-picker';

import { DataTable } from '../../common/data-table';
import { createColumns } from './columns';

interface ActivityTableProps {
  activities: ActivityItem[];
  pageSize?: number;
  showTitle?: boolean;
  showActions?: boolean;
}

export function ActivityTable({
  activities,
  pageSize,
  showTitle = true,
  showActions = true,
}: ActivityTableProps) {
  const [activeTab, setActiveTab] = useState('all');

  return (
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
          <DatePicker
            value={undefined}
            onChange={() => {}}
            icon={<ChevronDown className="ml-auto h-4 w-4" />}
          />
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
                value="Uploaded Document"
                className="text-[#667085] data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
              >
                Upload Document
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
          columns={createColumns(showActions)}
          data={activities}
          activeFilter={activeTab}
          pageSize={pageSize}
          isTabsPresent={true}
        />
      </CardContent>
    </Card>
  );
}
