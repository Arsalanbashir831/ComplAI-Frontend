'use client';

import { useState } from 'react';

import type { ActivityItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <Tabs
          defaultValue="all"
          className="mb-6"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList>
            <TabsTrigger
              value="Query Mode"
              className="data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
            >
              Query Mode
            </TabsTrigger>
            <TabsTrigger
              value="Uploaded Document"
              className="data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
            >
              Upload Document
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#0F9B5A1F] data-[state=active]:text-[#09B975]"
            >
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
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
