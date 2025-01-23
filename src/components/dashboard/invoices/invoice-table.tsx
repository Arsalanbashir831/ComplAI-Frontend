import { CloudUpload, Download } from 'lucide-react';

import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/data-table';
import { columns } from '@/components/dashboard/invoices/columns';

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[#687384] text-base">
          Here you will find your invoices.
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 text-[#546274] border-primary"
          >
            <CloudUpload className="h-4 w-4" />
            Export
          </Button>
          <Button variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={invoices}
        pageSize={20}
        isTabsPresent={false}
      />
    </div>
  );
}
