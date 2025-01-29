export type InvoiceStatus = 'paid' | 'failed';
export type PlanType = 'Lite' | 'Enterprise' | 'Premium';

export interface Invoice {
  id: string;
  invoiceId: string;
  billingDate: string;
  amount: number;
  plan: PlanType;
  status: InvoiceStatus;
}
