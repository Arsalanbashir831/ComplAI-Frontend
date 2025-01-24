import Image from 'next/image';
import { Check, Ellipsis, Plus } from 'lucide-react';

import type { PaymentCard } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentMethodProps {
  cards: PaymentCard[];
  onAddCard: () => void;
}

export function PaymentMethod({ cards, onAddCard }: PaymentMethodProps) {
  return (
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-fit w-fit p-0.5 rounded-full bg-[#BABABA]"
                >
                  <Ellipsis className="text-white w-2 h-2" />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Image
                  src={`/icons/${card.brand}.svg`}
                  alt={card.brand}
                  width={40}
                  height={24}
                  className="h-6 w-auto text-gray-dark"
                />
                <span className="text-sm">**** **** **** {card.lastFour}</span>
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
          onClick={onAddCard}
        >
          <span className="bg-[#BABABA] rounded-full p-2">
            <Plus className=" text-white" />
          </span>
        </Button>
      </div>
    </div>
  );
}
