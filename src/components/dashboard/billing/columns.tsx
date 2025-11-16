'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';

import { SafeDateDisplay } from '@/components/common/safe-date-display';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Invoice } from '@/types/invoice';

export const columns: ColumnDef<Invoice>[] = [
  {
    id: 'srNo',
    header: 'Sr No',
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      const srNo = pageIndex * pageSize + row.index + 1;
      return <div className="font-medium text-xs text-[#667085]">{srNo}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: 'invoiceId',
    header: 'Invoice Number',
    cell: ({ row }) => {
      return (
        <div className="font-medium text-xs text-[#667085]">
          {row.getValue('invoiceId')}
        </div>
      );
    },
  },
  {
    accessorKey: 'billingDate',
    header: 'Billing Date',
    cell: ({ row }) => {
      const date = row.getValue('billingDate') as string;
      return (
        <SafeDateDisplay
          date={date}
          format="date"
          className="font-medium text-xs text-[#667085]"
        />
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(amount);
      return (
        <div className="font-medium text-xs text-[#667085]">{formatted}</div>
      );
    },
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => {
      return (
        <div className="font-medium text-xs text-[#667085]">
          {row.getValue('plan')}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant="outline"
          className={cn(
            'text-xs border-none capitalize',
            status === 'paid'
              ? 'bg-[#EEF2FE] text-[#625AE7]'
              : 'bg-[#FFF1F1] text-[#F55873]'
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <Button
          variant="default"
          className="gap-2"
          onClick={() => {
            const downloadUrl = row.original.downloadLink;
            window.open(downloadUrl, '_blank');
          }}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
