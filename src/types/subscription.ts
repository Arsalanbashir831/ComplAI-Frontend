export type PlanType = 'pay-as-you-use' | 'professional' | 'enterprise';

export interface Plan {
  type: PlanType;
  title: string;
  price: string;
  interval?: string;
  description: string;
  minimumTerm?: string;
  buttonText: string;
  buttonAction: () => void;
}

export interface PaymentCard {
  id: string;
  type: 'credit' | 'debit';
  brand: 'mastercard' | 'visa';
  lastFour: string;
  isDefault?: boolean;
}
