'use client';

import { useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { PaymentCard } from '@/types/subscription';
import apiCaller from '@/config/apiCaller';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddCardModalProps {
  onClose: () => void;
  onCardAdded: (newCard: PaymentCard) => void;
}

export function AddCardModal({ onClose, onCardAdded }: AddCardModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMsg('Card element not found.');
      setLoading(false);
      return;
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setErrorMsg(error.message || 'An error occurred.');
      setLoading(false);
      return;
    }

    try {
      // Call your API endpoint to add the card
      const response = await apiCaller(
        API_ROUTES.BILLING.ADD_CARD, // Ensure this constant is defined with your endpoint URL
        'POST',
        { payment_method_id: paymentMethod.id },
        {},
        true,
        'json'
      );
      // Notify parent of success (could trigger a refetch or update your local card list)
      onCardAdded(response.data);
      onClose();
    } catch (apiError) {
      console.error(apiError);
      setErrorMsg('Failed to attach card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Payment Method</DialogTitle>
          <DialogDescription>
            Enter your card details below to add a new payment method.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                  invalid: { color: '#9e2146' },
                },
              }}
            />
          </div>
          {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={!stripe || loading}>
              {loading ? 'Adding...' : 'Add Card'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
