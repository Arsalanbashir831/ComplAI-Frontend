'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

import type { ActivityItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';

export const createColumns = (
  showActions = false,
  onView?: (activity: ActivityItem) => void
): ColumnDef<ActivityItem>[] => {
  const baseColumns: ColumnDef<ActivityItem>[] = [
    {
      accessorKey: 'id',
      header: () => <div className="ml-8">Serial No</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const serialNo = row.getValue('id') as string | number;
        return <div className="text-[#5483CA] text-center">{serialNo}</div>;
      },
    },
    {
      accessorKey: 'usage_date',
      header: 'Requested at',
      enableSorting: true,
      cell: ({ row }) => {
        const date = new Date(row.getValue('usage_date'));
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {date.toLocaleDateString('en-US')}
            </span>
            <span className="text-xs text-[#999999]">
              {date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'activityType',
      header: 'Activity Type',
      enableSorting: true,
      // cell: ({ row }) => {
      //   const activityType = row.getValue('activityType') as string;
      //   return <div className="font-medium text-[#667085]">{activityType}</div>;
      // },
      cell: () => {
        return <div className="font-medium text-[#667085]">Query Mode</div>;
      },
    },
    {
      accessorKey: 'tokens_used',
      header: 'Tokens Deducted',
      enableSorting: false,
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue('tokens_used'));
        return <div className="font-medium text-[#667085]">{amount}</div>;
      },
    },
  ];

  if (showActions) {
    baseColumns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#667085] hover:text-[#5483CA] hover:bg-[#F0F3FF]"
              onClick={() => onView?.(activity)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    });
  }

  return baseColumns;
};
