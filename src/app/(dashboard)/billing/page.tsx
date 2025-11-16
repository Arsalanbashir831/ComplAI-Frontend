'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { useEffect, useState } from 'react';

import InvoiceTable from '@/components/dashboard/billing/invoice-table';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Card, CardHeader } from '@/components/ui/card';
import apiCaller from '@/config/apiCaller';
import type { Invoice } from '@/types/invoice';

export default function BillingPage() {
  const [billingData, setBillingData] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await apiCaller(
          API_ROUTES.BILLING.INVOICES,
          'GET',
          {},
          {},
          true,
          'json'
        );
        
        // API returns an object with "invoices" and "charges" properties
        const apiInvoices = response.data.invoices || [];
        const apiCharges = response.data.charges || [];
        
        console.log('📊 [Billing] Fetched data:', {
          invoicesCount: apiInvoices.length,
          chargesCount: apiCharges.length,
        });
        
        // Transform invoices
        const transformedInvoices: Invoice[] = apiInvoices.map(
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
            billingDate: new Date(inv.created * 1000).toISOString(),
            amount: inv.amount_paid / 100,
            plan: inv.lines?.data?.[0]?.description || 'N/A',
            status: inv.status,
            downloadLink: inv.invoice_pdf,
            type: 'invoice' as const,
          })
        );
        
        // Transform charges
        const transformedCharges: Invoice[] = apiCharges.map(
          (charge: {
            id: string;
            created: number;
            amount: number;
            description?: string;
            status: string;
            receipt_url?: string;
            metadata?: { tokens?: string };
          }) => ({
            id: charge.id,
            invoiceId: charge.id,
            billingDate: new Date(charge.created * 1000).toISOString(),
            amount: charge.amount / 100,
            plan: charge.description || 
                  (charge.metadata?.tokens ? `${charge.metadata.tokens} Tokens` : 'One-time Payment'),
            status: charge.status === 'succeeded' ? 'paid' : charge.status,
            downloadLink: charge.receipt_url || '',
            type: 'charge' as const,
            receiptUrl: charge.receipt_url,
          })
        );
        
        // Combine both arrays and sort by billing date (newest first)
        const combined = [...transformedInvoices, ...transformedCharges].sort(
          (a, b) => new Date(b.billingDate).getTime() - new Date(a.billingDate).getTime()
        );
        
        console.log('✅ [Billing] Combined and sorted:', {
          total: combined.length,
          sample: combined.slice(0, 3),
        });
        
        setBillingData(combined);
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  if (isLoading) {
    return (
      <Card className="min-h-screen w-full flex flex-col justify-center items-center px-6 py-8 animate-pulse ">
        <CardHeader className="flex w-full flex-col items-center justify-between items-end">
          <div className="h-20 w-72 bg-gray-200 rounded" />
          <div className="h-96 w-full bg-gray-200 rounded" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 bg-[#F9F9FC]">
      <DashboardHeader
        title="Billing Information"
        subtitle="Here you can view your Invoices and Charges"
      />

      <div className="flex flex-col justify-center flex-1 w-full rounded-xl">
        <InvoiceTable invoices={billingData} />
      </div>
    </div>
  );
}
