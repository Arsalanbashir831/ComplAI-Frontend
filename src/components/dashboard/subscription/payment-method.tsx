// PaymentMethod.tsx
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

import type { PaymentCard } from '@/types/subscription';
import apiCaller from '@/config/apiCaller';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { AddCardModal } from './add-card-modal';

interface PaymentMethodProps {
  cards: PaymentCard[];
  onCardAdded?: (newCard: PaymentCard) => void;
  onCardRemoved?: (cardId: string) => void;
}

export function PaymentMethod({
  cards,
  onCardAdded,
  onCardRemoved,
}: PaymentMethodProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  console.log(cards);

  const handleAddCardClick = () => {
    setShowAddCard(true);
  };

  const handleCloseModal = () => {
    setShowAddCard(false);
  };

  const handleCardAdded = (newCard: PaymentCard) => {
    if (onCardAdded) {
      onCardAdded(newCard);
    }
    setShowAddCard(false);
  };

  const handleRemoveCard = async (cardId: string) => {
    try {
      await apiCaller(
        API_ROUTES.BILLING.REMOVE_CARD,
        'DELETE',
        { payment_method_id: cardId },
        {},
        true,
        'json'
      );
      // Update parent state via callback.
      if (onCardRemoved) {
        onCardRemoved(cardId);
      }
    } catch (error) {
      console.error('Failed to remove card:', error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Payment Method</h2>
        <div className="flex flex-wrap gap-5">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`relative max-w-60 ${card.isDefault ? 'border-[#008000] border-2' : ''}`}
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between space-x-4">
                  <p className="font-medium">
                    <span className="capitalize">{card.type}</span> card
                  </p>

                  {/* Menu Icon */}
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
                      >
                        <CircleCheckBig className="mr-2" />
                        Make Default
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700"
                      >
                        <Edit className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700"
                        onClick={() => handleRemoveCard(card.id)}
                      >
                        <Trash className="mr-2" />
                        Remove
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
                {card.isDefault && (
                  <div className="absolute -top-6 -right-2">
                    <Check className="text-white bg-[#008000] rounded-full p-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            className="h-auto max-w-60 w-full border-[#BABABA] bg-[#ECEBEB] hover:bg-[#E3E3E3]"
            onClick={handleAddCardClick}
          >
            <span className="bg-[#BABABA] rounded-full p-2">
              <Plus className="text-white" />
            </span>
          </Button>
        </div>
      </div>
      {showAddCard && (
        <AddCardModal
          onClose={handleCloseModal}
          onCardAdded={handleCardAdded}
        />
      )}
    </>
  );
}
