'use client';

import type { ColumnDef } from '@tanstack/react-table';

import type { Invoice } from '@/types/invoice';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Invoice>[] = [
  {
    id: 'select',
    // header: ({ table }) => (
    //   <Checkbox
    //     checked={
    //       table.getIsAllPageRowsSelected() ||
    //       (table.getIsSomePageRowsSelected() && 'indeterminate')
    //     }
    //     onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //     aria-label="Select all"
    //   />
    // ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-[#B6C2E2] ml-8"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'invoiceId',
    header: 'Invoice',
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
      const date = new Date(row.getValue('billingDate'));
      return (
        <div className="font-medium text-xs text-[#667085]">
          {date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
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
];
