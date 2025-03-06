export type PlanType = 'free' | 'subscription' | 'enterprise';

export interface Plan {
  type: PlanType;
  title: string;
  price: string;
  interval?: string;
  description: string;
  minimumTerm?: string;
  buttonText: string;
  special: boolean;
  buttonAction: () => void;
}

export interface PaymentCard {
  exp_year: number | undefined;
  exp_month: number | undefined;
  id: string;
  type: 'credit' | 'debit';
  brand: 'mastercard' | 'visa';
  lastFour: string;
  isDefault?: boolean;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  start_date: string;
  end_date: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  stripe_customer_email: string;
}
