'use client';

import { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  activeFilter?: string;
  pageSize?: number;
  isTabsPresent?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  activeFilter,
  pageSize = 5,
  isTabsPresent = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    if (isTabsPresent) {
      if (activeFilter !== 'all') {
        table.getColumn('activityType')?.setFilterValue(activeFilter);
      } else {
        table.getColumn('activityType')?.setFilterValue('');
      }
    }
  }, [isTabsPresent, activeFilter, table]);

  return (
    <div>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-[#F0F1F3] bg-[#F7F9FC]"
              >
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className="text-[#1D1F2C]"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: isSortable ? 'pointer' : 'default' }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSortable && (
                          <div className="w-4">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-[#F0F1F3]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-[#667085]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center px-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div> */}
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                showLabel={false}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.previousPage();
                }}
                isActive={table.getCanPreviousPage()}
                className="border border-[#DFE3E8] pr-2.5 text-[#667085]"
              />
            </PaginationItem>
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
              (page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.setPageIndex(page - 1);
                    }}
                    isActive={
                      table.getState().pagination.pageIndex + 1 === page
                    }
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                showLabel={false}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.nextPage();
                }}
                isActive={table.getCanNextPage()}
                className="border border-[#DFE3E8] pl-2.5 text-[#667085]"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
