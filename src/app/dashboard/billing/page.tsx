import type { Invoice } from '@/types/invoice';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import InvoiceTable from '@/components/dashboard/invoices/invoice-table';

const invoices: Invoice[] = [
  {
    id: '1',
    invoiceId: 'Invoice #011',
    billingDate: '10/2/2024',
    amount: 25.0,
    plan: 'Lite',
    status: 'paid',
  },
  {
    id: '2',
    invoiceId: 'Invoice #222',
    billingDate: '10/2/2024',
    amount: 25.0,
    plan: 'Enterprise',
    status: 'failed',
  },
  {
    id: '3',
    invoiceId: 'Invoice #022',
    billingDate: '10/2/2024',
    amount: 25.0,
    plan: 'Premium',
    status: 'failed',
  },
  {
    id: '4',
    invoiceId: 'Invoice #456',
    billingDate: '10/2/2024',
    amount: 25.0,
    plan: 'Enterprise',
    status: 'paid',
  },
  {
    id: '5',
    invoiceId: 'Invoice #678',
    billingDate: '10/2/2024',
    amount: 25.0,
    plan: 'Enterprise',
    status: 'paid',
  },
  {
    id: '6',
    invoiceId: 'Invoice #123',
    billingDate: '10/2/2024',
    amount: 25.0,
    plan: 'Premium',
    status: 'paid',
  },
  {
    id: '7',
    invoiceId: 'Invoice #132',
    billingDate: '10/2/2024',
    amount: 25.0,
    plan: 'Premium',
    status: 'failed',
  },
];

export default function BillingPage() {
  return (
    <div className="p-6 flex flex-col gap-y-16 bg-[#F9F9FC]">
      <DashboardHeader title="Billings History" badgeTitle="18 Total" />

      <InvoiceTable invoices={invoices} />
    </div>
  );
}
