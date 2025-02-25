'use client';

import { useState } from 'react';
import Image from 'next/image';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  CircleCheckBig,
  Edit,
  Ellipsis,
  Plus,
  Trash,
} from 'lucide-react';

import type { PaymentCard } from '@/types/subscription';
import apiCaller from '@/config/apiCaller';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

import { PaymentCardModal } from './payment-card-modal';

interface PaymentMethodProps {
  cards: PaymentCard[];
  onCardAdded?: (newCard: PaymentCard) => void;
  onCardUpdated?: (updatedCard: PaymentCard) => void;
  onCardRemoved?: (cardId: string) => void;
  isLoading: boolean;
}

type ModalState = {
  open: boolean;
  mode: 'add' | 'edit';
  card?: PaymentCard;
};

// Fetch the stripe customer info, which includes the default card ID
const fetchStripeCustomer = async (): Promise<{
  default_payment_method: string;
}> => {
  const response = await apiCaller(
    API_ROUTES.BILLING.STRIPE_CUSTOMER,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
};

export function PaymentMethod({
  cards,
  onCardAdded,
  onCardUpdated,
  onCardRemoved,
  isLoading,
}: PaymentMethodProps) {
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    mode: 'add',
  });

  // Query to fetch the stripe customer info
  const { data: stripeCustomer, refetch: refetchCustomer } = useQuery({
    queryKey: ['stripeCustomer'],
    queryFn: fetchStripeCustomer,
    staleTime: 1000 * 60 * 5,
  });

  // Open modal in "add" mode
  const handleAddCardClick = () => {
    setModalState({ open: true, mode: 'add' });
  };

  // Open modal in "edit" mode with the selected card’s details
  const handleEditCardClick = (card: PaymentCard) => {
    setModalState({ open: true, mode: 'edit', card });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'add' });
  };

  // This callback is triggered on both successful add and edit operations.
  const handleModalSuccess = (card: PaymentCard) => {
    if (modalState.mode === 'add') {
      if (onCardAdded) onCardAdded(card);
    } else if (modalState.mode === 'edit') {
      if (onCardUpdated) onCardUpdated(card);
    }
    handleCloseModal();
    refetchCustomer();
  };

  const handleMakeDefault = async (cardId: string) => {
    try {
      await apiCaller(
        API_ROUTES.BILLING.DEFAULT_CARD,
        'POST',
        { payment_method_id: cardId },
        {},
        true,
        'json'
      );
      alert('Default card set successfully.');
      refetchCustomer();
    } catch (error) {
      console.error('Failed to set default card:', error);
      alert('Failed to set default card.');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await apiCaller(
        API_ROUTES.BILLING.DELETE_CARD,
        'DELETE',
        { payment_method_id: cardId },
        {},
        true,
        'json'
      );
      if (onCardRemoved) onCardRemoved(cardId);
      alert('Card deleted successfully.');
      refetchCustomer();
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card.');
    }
  };

  console.log('stripeCustomer', stripeCustomer);
  console.log('cards', cards);

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Payment Method</h2>
        <div className="flex flex-wrap gap-5">
          {isLoading ? (
            <Skeleton className="h-auto min-h-28 w-full max-w-60 rounded-md" />
          ) : (
            cards.map((card) => {
              // Compare each card's id to the default card returned from the stripe customer info.
              const isDefault =
                stripeCustomer?.default_payment_method === card.id;
              return (
                <Card
                  key={card.id}
                  className={`relative max-w-60 ${isDefault ? 'border-[#008000] border-2' : ''}`}
                >
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between space-x-4">
                      <p className="font-medium">
                        <span className="capitalize">{card.type}</span> card
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-fit w-fit p-0.5 rounded-full bg-[#BABABA] hover:bg-[#B0B0B0]"
                          >
                            <Ellipsis className="text-white w-2 h-2" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="py-2 flex flex-col max-w-44">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700"
                            onClick={() => handleMakeDefault(card.id)}
                          >
                            <CircleCheckBig className="mr-2" />
                            Make Default
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700"
                            onClick={() => handleEditCardClick(card)}
                          >
                            <Edit className="mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <Trash className="mr-2" />
                            Delete
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Image
                        src={`/icons/${card.brand}.svg`}
                        alt={card.brand}
                        width={40}
                        height={24}
                        className="h-6 w-auto text-gray-dark"
                      />
                      <span className="text-sm">
                        **** **** **** {card.lastFour}
                      </span>
                    </div>
                    {isDefault && (
                      <div className="absolute -top-6 -right-2">
                        <Check className="text-white bg-[#008000] rounded-full p-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
          <Button
            variant="outline"
            className="h-auto max-w-60 min-h-28 w-full border-[#BABABA] bg-[#ECEBEB] hover:bg-[#E3E3E3]"
            onClick={handleAddCardClick}
          >
            <span className="bg-[#BABABA] rounded-full p-2">
              <Plus className="text-white" />
            </span>
          </Button>
        </div>
      </div>

      {modalState.open && (
        <PaymentCardModal
          mode={modalState.mode}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
          {...(modalState.mode === 'edit' && modalState.card
            ? {
                paymentMethodId: modalState.card.id,
                initialExpMonth: modalState.card.exp_month,
                initialExpYear: modalState.card.exp_year,
              }
            : {})}
        />
      )}
    </>
  );
}
