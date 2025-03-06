import { Invoice } from '@/types/invoice';
import { DataTable } from '@/components/common/data-table';
import { columns } from '@/components/dashboard/billing/columns';

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="bg-white  rounded-xl w-full mx-auto">
      <div className="flex items-center justify-between mb-2 p-6">
        <h1 className="text-[#687384] text-base">
          {/* Here you will find your invoices. */}
        </h1>
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
