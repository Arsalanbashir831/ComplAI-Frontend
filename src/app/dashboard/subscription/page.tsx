'use client';

import { useState } from 'react';

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
      'Designed for firms with minimal compliance needs, this package offers only basic tools and features for occasional compliance support. It’s suited for those with straightforward regulatory requirements and low demand for ongoing assistance. ',
    buttonText: 'Add More Tokens',
    special: false,
    buttonAction: () => console.log('Add tokens'),
  },
  {
    type: 'professional',
    title: 'Professional',
    price: '£49',
    interval: 'month',
    minimumTerm: '12 Months',
    description:
      'Ideal for firms that require regular compliance support and aim to uphold key accreditations like Lexcel, SQM, and Law Society standards. With advanced features and ongoing expert assistance, this package keeps your firm ahead of regulatory challenges. Our most popular and highly recommended choice for staying fully compliant and in control.',
    buttonText: 'Switch Subscription',
    special: true,
    buttonAction: () => console.log('Switch to Professional'),
  },
  {
    type: 'enterprise',
    title: 'Enterprise',
    price: '£POA',
    minimumTerm: '24 Months',
    description:
      'Our most powerful solution, packed with every feature to meet the highest compliance demands. Ideal for firms operating in high-risk sectors, servicing multiple areas of law, or managing high-volume litigation. Custom solutions are also available to meet specific needs',
    buttonText: 'Contact Sales',
    special: false,
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
  // const router = useRouter();
  const [autoRenew, setAutoRenew] = useState(false);

  const handleAddCard = () => {
    console.log('Add new card');
  };

  // Update plans with router
  const plansWithRouter = plans.map((plan) => ({
    ...plan,
    buttonAction: plan.buttonAction,
    // plan.type === 'enterprise'
    //   ? () => router.push(ROUTES.ENTERPRISE_SUBSCRIPTION)
    //   : plan.buttonAction,
  }));

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 ">
      {/* Header Stays at the Top */}
      <DashboardHeader title="Subscription" />

      {/* Centered Content */}
      <div className="flex flex-col justify-center flex-1 w-full  bg-white  rounded-xl p-8 space-y-8 mt-3">
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
