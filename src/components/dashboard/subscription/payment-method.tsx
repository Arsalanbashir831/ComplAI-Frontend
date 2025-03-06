'use client';

import { useState } from 'react';
import Image from 'next/image';
import { API_ROUTES } from '@/constants/apiRoutes';
import {
  Check,
  CircleCheckBig,
  Edit,
  Ellipsis,
  Plus,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { ConfirmationModal } from '@/components/common/confirmation-modal';

import { PaymentCardModal } from './payment-card-modal';

type ModalState = {
  open: boolean;
  mode: 'add' | 'edit';
  card?: PaymentCard;
};

interface PaymentMethodProps {
  stripeCustomer: { default_payment_method: string | null } | undefined;
  refetchCustomer: () => void;
  cards: PaymentCard[];
  onCardAdded?: (newCard: PaymentCard) => void;
  onCardUpdated?: (updatedCard: PaymentCard) => void;
  onCardRemoved?: (cardId: string) => void;
  isLoading: boolean;
}

export function PaymentMethod({
  stripeCustomer,
  refetchCustomer,
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
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [cardId, setCardId] = useState<string>('');

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
      // If there is no default card, automatically make the newly added card default.
      if (!stripeCustomer?.default_payment_method) {
        handleMakeDefault(card.id);
      }
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
      toast.success('Default card set successfully.');
      refetchCustomer();
    } catch {
      toast.error('Failed to set default card.');
    }
  };

  // Prevent deletion of the default card.
  const handleDeleteCard = async (cardId: string) => {
    if (stripeCustomer?.default_payment_method === cardId) {
      toast.error('You must change the default card first.');
      return;
    }
    setCardId(cardId);
    setIsConfirmationModalOpen(true);
  };

  const confirmDeleteCard = async () => {
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
      toast.success('Card deleted successfully.');
      refetchCustomer();
    } catch {
      toast.error('Failed to delete card.');
    } finally {
      setIsConfirmationModalOpen(false);
      setCardId('');
    }
  };

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

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        title="Delete Card"
        description="Are you sure you want to delete this card?"
        onConfirm={confirmDeleteCard}
        onCancel={() => setIsConfirmationModalOpen(false)}
      />
    </>
  );
}
