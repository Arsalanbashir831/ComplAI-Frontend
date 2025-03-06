'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';

import type { Invoice } from '@/types/invoice';
import apiCaller from '@/config/apiCaller';
import InvoiceTable from '@/components/dashboard/billing/invoice-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await apiCaller(
          API_ROUTES.BILLING.INVOICES, // Make sure this constant points to '/api/billing/invoices/'
          'GET',
          {},
          {},
          true,
          'json'
        );
        // API returns an object with an "invoices" property
        const apiInvoices = response.data.invoices;
        const transformed: Invoice[] = apiInvoices.map(
          (inv: {
            id: string;
            number?: string;
            created: number;
            amount_paid: number;
            lines?: { data?: { description?: string }[] };
            status: string;
            invoice_pdf: string;
          }) => ({
            id: inv.id,
            invoiceId: inv.number || inv.id,
            billingDate: new Date(inv.created * 1000).toLocaleDateString(),
            amount: inv.amount_paid / 100,
            plan: inv.lines?.data?.[0]?.description || 'N/A',
            status: inv.status,
            downloadLink: inv.invoice_pdf,
          })
        );
        setInvoices(transformed);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 bg-[#F9F9FC]">
      <DashboardHeader
        title="Billing Information"
        subtitle="Here you can view your Previous Invoices"
      />

      <div className="flex flex-col justify-center flex-1 w-full rounded-xl">
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}
