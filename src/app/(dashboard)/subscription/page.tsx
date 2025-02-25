'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import type { PaymentCard, Plan } from '@/types/subscription';
import apiCaller from '@/config/apiCaller';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { PaymentMethod } from '@/components/dashboard/subscription/payment-method';
import { PricingCard } from '@/components/dashboard/subscription/pricing-card';
import { SubscriptionInfo } from '@/components/dashboard/subscription/subscription-info';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function SubscriptionPage() {
  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [fetchedPlans, setFetchedPlans] = useState<Plan[]>([]);

  // Fetch payment cards from backend
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await apiCaller(
          API_ROUTES.BILLING.LIST_CARDS,
          'GET',
          {},
          {},
          true,
          'json'
        );
        // Transform API response to PaymentCard[]
        const cards: PaymentCard[] = response.data.cards.map(
          (card: {
            id: string;
            card: { funding: string; brand: string; last4: string };
          }) => ({
            id: card.id,
            type: card.card.funding, // "credit" or "debit"
            brand: card.card.brand,
            lastFour: card.card.last4, // rename last4 to lastFour
            isDefault: false, // update if your API provides default info
          })
        );
        setPaymentCards(cards);
      } catch (error) {
        console.error('Failed to fetch payment cards:', error);
      }
    };

    fetchCards();
  }, []);

  // Function for purchasing tokens (one-time payment)
  const purchaseTokens = async (productId: number) => {
    // Choose a payment method: default or first available
    let paymentMethodId: string | undefined;
    const defaultCard = paymentCards.find((card) => card.isDefault);
    if (defaultCard) {
      paymentMethodId = defaultCard.id;
    } else if (paymentCards.length > 0) {
      paymentMethodId = paymentCards[0].id;
    }

    if (!paymentMethodId) {
      alert('Please add a payment method before purchasing tokens.');
      return;
    }

    try {
      const response = await apiCaller(
        API_ROUTES.BILLING.CREATE_ONE_TIME_PAYMENT_INTENT,
        'POST',
        {
          product_id: productId,
          payment_method_id: paymentMethodId,
        },
        {},
        true,
        'json'
      );
      console.log('One-time payment intent created:', response);
      alert('Token purchase successful!');
    } catch (error) {
      console.error('Token purchase failed:', error);
      alert('Token purchase failed, please try again.');
    }
  };

  // Subscribe function for professional/enterprise plans
  const subscribeToPlan = async (
    planType: 'professional' | 'enterprise',
    subscriptionPlanId: number
  ) => {
    // Choose a payment method: default or first available
    let paymentMethodId: string | undefined;
    const defaultCard = paymentCards.find((card) => card.isDefault);
    if (defaultCard) {
      paymentMethodId = defaultCard.id;
    } else if (paymentCards.length > 0) {
      paymentMethodId = paymentCards[0].id;
    }

    if (!paymentMethodId) {
      alert('Please add a payment method before subscribing.');
      return;
    }

    try {
      const response = await apiCaller(
        API_ROUTES.BILLING.SUBSCRIBE,
        'POST',
        {
          subscription_plan_id: subscriptionPlanId,
          payment_method_id: paymentMethodId,
        },
        {},
        true,
        'json'
      );
      console.log('Subscription successful:', response);
      alert('Subscription successful!');
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Subscription failed, please try again.');
    }
  };

  // Fetch subscription items from backend and build the plans array
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await apiCaller(
          API_ROUTES.BILLING.ITEMS,
          'GET',
          {},
          {},
          true,
          'json'
        );
        const { products, subscription_plans } = response.data;
        const plansArray: Plan[] = [];

        // Create a pay-as-you-use plan using the first product.
        // Calls the create-one-time-payment-intent endpoint.
        if (products && products.length > 0) {
          const product = products[0];
          plansArray.push({
            type: 'pay-as-you-use',
            title: product.name,
            price: `£${(product.price / 100).toFixed(0)}`,
            description: product.description,
            buttonText: 'Purchase Tokens',
            special: false,
            buttonAction: () => purchaseTokens(product.id),
          });
        }

        // Create a professional plan using the first subscription plan.
        // Note: As per your requirement, we call subscribe endpoint with subscription_plan_id: 2.
        if (subscription_plans && subscription_plans.length > 0) {
          const subPlan = subscription_plans[0];
          plansArray.push({
            type: 'professional',
            title: subPlan.name,
            price: `£${(subPlan.price / 100).toFixed(0)}`,
            interval: subPlan.interval,
            description: subPlan.description,
            buttonText: 'Subscribe',
            special: true,
            buttonAction: () => subscribeToPlan('professional', 2),
          });
        }

        // Hard-coded enterprise plan.
        plansArray.push({
          type: 'enterprise',
          title: 'Enterprise',
          price: '£POA',
          minimumTerm: '24 Months',
          description:
            'Our most powerful solution, packed with every feature to meet the highest compliance demands. Ideal for firms operating in high-risk sectors, servicing multiple areas of law, or managing high-volume litigation. Custom solutions are also available to meet specific needs.',
          buttonText: 'Contact Sales',
          special: false,
          buttonAction: () => subscribeToPlan('enterprise', 3), // Hard-coded enterprise id
        });

        setFetchedPlans(plansArray);
      } catch (error) {
        console.error('Failed to fetch subscription items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleAddCard = (newCard: PaymentCard) => {
    setPaymentCards((prevCards) => [...prevCards, newCard]);
  };

  const handleRemoveCard = (cardId: string) => {
    setPaymentCards((prevCards) =>
      prevCards.filter((card) => card.id !== cardId)
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 ">
      <DashboardHeader title="Subscription" />

      <Elements stripe={stripePromise}>
        <div className="flex flex-col justify-center flex-1 w-full bg-white rounded-xl p-8 space-y-8 mt-3">
          <div>
            <h1 className="text-2xl font-semibold mb-6">Plans</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fetchedPlans.map((plan) => (
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

          <PaymentMethod
            cards={paymentCards}
            onCardAdded={handleAddCard}
            onCardRemoved={handleRemoveCard}
          />
        </div>
      </Elements>
    </div>
  );
}
