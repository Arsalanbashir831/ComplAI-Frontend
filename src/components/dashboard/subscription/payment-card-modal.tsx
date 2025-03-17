'use client';

import { useState } from 'react';
import Image from 'next/image';
import { API_ROUTES } from '@/constants/apiRoutes';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import type { PaymentCard } from '@/types/subscription';
import apiCaller from '@/config/apiCaller';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PaymentCardModalProps {
  mode: 'add' | 'edit';
  paymentMethodId?: string; // required in edit mode
  onClose: () => void;
  onSuccess: (card: PaymentCard) => void;
}

export function PaymentCardModal({
  mode,
  paymentMethodId,
  onClose,
  onSuccess,
}: PaymentCardModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // For edit mode, store the selected date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mutation for adding a new card
  const addCardMutation = useMutation({
    mutationFn: async (pmId: string) => {
      const response = await apiCaller(
        API_ROUTES.BILLING.ADD_CARD,
        'POST',
        { payment_method_id: pmId },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess(data);
      onClose();
    },
    onError: () => {
      setErrorMsg('Failed to attach card.');
    },
  });

  // Mutation for editing the card expiration date
  const editCardMutation = useMutation({
    mutationFn: async ({
      paymentMethodId,
      exp_month,
      exp_year,
    }: {
      paymentMethodId: string;
      exp_month: number;
      exp_year: number;
    }) => {
      const response = await apiCaller(
        API_ROUTES.BILLING.EDIT_CARD,
        'POST',
        { payment_method_id: paymentMethodId, exp_month, exp_year },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess(data);
      onClose();
    },
    onError: () => {
      setErrorMsg('Failed to update card.');
    },
  });

  // Handler for add mode using CardElement
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMsg('Card element not found.');
      return;
    }
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
    if (error) {
      setErrorMsg(error.message || 'An error occurred.');
      return;
    }
    addCardMutation.mutate(paymentMethod.id);
  };

  // Handler for edit mode using the shadcn date picker
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!paymentMethodId) {
      setErrorMsg('Missing payment method ID.');
      return;
    }
    if (!selectedDate) {
      setErrorMsg('Please select a valid expiration date.');
      return;
    }
    // Extract month and year from the selected date
    const exp_month = selectedDate.getMonth() + 1;
    const exp_year = selectedDate.getFullYear();
    editCardMutation.mutate({
      paymentMethodId,
      exp_month,
      exp_year,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Image src={'/stripe.svg'} alt="stripe" width={100} height={100} />
          <DialogTitle>
            {mode === 'add' ? 'Add a Payment Method' : 'Edit Card Expiration'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Enter your card details below to add a new payment method.'
              : 'Select a new expiration date for your card.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={mode === 'add' ? handleAddSubmit : handleEditSubmit}
          className="space-y-6"
        >
          {mode === 'add' ? (
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
          ) : (
            <div className="mb-4">
              <Label htmlFor="expiration-date" className="mb-2">
                Expiration Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, 'MM/yyyy')
                      : 'Select expiration date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => setSelectedDate(date || null)}
                    // Optionally you can disable past dates
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={
                mode === 'add'
                  ? !stripe || addCardMutation.status === 'pending'
                  : editCardMutation.status === 'pending'
              }
            >
              {mode === 'add'
                ? addCardMutation.status === 'pending'
                  ? 'Adding...'
                  : 'Add Card'
                : editCardMutation.status === 'pending'
                  ? 'Saving...'
                  : 'Save'}
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
