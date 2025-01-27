'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

import type { PaymentCard, Plan } from '@/types/subscription';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { PaymentMethod } from '@/components/dashboard/subscription/payment-method';
import { PricingCard } from '@/components/dashboard/subscription/pricing-card';
import { SubscriptionInfo } from '@/components/dashboard/subscription/subscription-info';

const plans: Plan[] = [
  {
    type: 'pay-as-you-use',
    title: 'Pay as you use',
    price: '£50 Top up',
    description:
      'Suitable for firms with 1-10 employees who only need occasional support on compliance. ',
    buttonText: 'Add More Tokens',
    buttonAction: () => console.log('Add tokens'),
  },
  {
    type: 'professional',
    title: 'Professional',
    price: '£49',
    interval: 'month',
    minimumTerm: '12 Months',
    description:
      'Better suited for firms who need to maintain accreditation such as Lexcel, SQM and Law Society and want to remain firmly on top of their compliance requirements.',
    buttonText: 'Switch Subscription',
    buttonAction: () => console.log('Switch to Professional'),
  },
  {
    type: 'enterprise',
    title: 'Enterprise',
    price: '£POA',
    minimumTerm: '24 Months',
    description:
      'Our most powerful product with all the features. Best suited for firms servicing high risk areas, mulitple service areas of law and/or volume litigation providers.',
    buttonText: 'Apply Now',
    buttonAction: () => console.log('Apply for Enterprise'),
  },
];

const paymentCards: PaymentCard[] = [
  {
    id: '1',
    type: 'credit',
    brand: 'mastercard',
    lastFour: '7362',
    isDefault: true,
  },
  {
    id: '2',
    type: 'debit',
    brand: 'visa',
    lastFour: '4356',
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [autoRenew, setAutoRenew] = useState(false);

  const handleAddCard = () => {
    console.log('Add new card');
  };

  // Update plans with router
  const plansWithRouter = plans.map((plan) => ({
    ...plan,
    buttonAction:
      plan.type === 'enterprise'
        ? () => router.push(ROUTES.ENTERPRISE_SUBSCRIPTION)
        : plan.buttonAction,
  }));

  return (
    <div className="p-6 flex flex-col gap-y-8">
      <DashboardHeader title="Subscription" />

      <div className="px-6 py-10 bg-white shadow-md rounded-xl w-full mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-6">Plans</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansWithRouter.map((plan) => (
              <PricingCard
                key={plan.type}
                plan={plan}
                isActive={plan.type === 'pay-as-you-use'}
              />
            ))}
          </div>
        </div>

        <SubscriptionInfo
          plan="Pay as you use"
          startDate="10-01-2024"
          renewalDate="10-02-2024"
          autoRenew={autoRenew}
          onAutoRenewChange={setAutoRenew}
        />

        <PaymentMethod cards={paymentCards} onAddCard={handleAddCard} />
      </div>
    </div>
  );
}
