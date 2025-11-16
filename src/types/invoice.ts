export type InvoiceStatus = 'paid' | 'failed' | 'succeeded';
export type PlanType = 'Lite' | 'Enterprise' | 'Premium';
export type BillingType = 'invoice' | 'charge';

export interface Invoice {
  id: string;
  invoiceId: string;
  billingDate: string;
  amount: number;
  plan: PlanType | string;
  status: InvoiceStatus;
  downloadLink: string;
  type: BillingType; // To differentiate between invoice and charge
  receiptUrl?: string; // For charges only
}
