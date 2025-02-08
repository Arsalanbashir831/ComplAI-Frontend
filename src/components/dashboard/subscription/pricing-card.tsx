import { Check } from 'lucide-react';

import type { Plan } from '@/types/subscription';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PricingCardProps {
  plan: Plan;
  isActive?: boolean;
}

export function PricingCard({ plan, isActive }: PricingCardProps) {
  const isPayAsYouUse = plan.type === 'pay-as-you-use';

  return (
    <Card
      className={cn(
        'w-full h-full flex flex-col relative border-2',
        !isPayAsYouUse ? 'bg-blue-dark ' : 'bg-[#fafffa] border-green-400'
      )}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2">
          <Check className="text-white bg-[#008000] rounded-full p-1 size-8" />
        </div>
      )}

      {plan.special && (
        <div className="absolute left-1 top-1  bg-green-600 text-white text-sm px-2 py-1 rounded-md">
          Recommended
        </div>
      )}

      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex flex-col justify-between space-y-4 h-full">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <h3
                  className={cn(
                    'font-medium text-xl',
                    !isPayAsYouUse && 'text-white'
                  )}
                >
                  {plan.title}
                </h3>
                <div className="flex flex-col items-baseline">
                  <div
                    className={cn(
                      'text-sm text-right',
                      !isPayAsYouUse ? 'text-white' : 'text-gray-dark'
                    )}
                  >
                    {plan.minimumTerm} Minimum
                  </div>
                  <div
                    className={cn(!isPayAsYouUse ? 'text-white' : 'text-black')}
                  >
                    <span className="text-xl font-bold">{plan.price}</span>
                    {plan.interval && (
                      <span className="ml-1">/{plan.interval}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p
              className={cn(
                'text-sm text-muted-foreground',
                !isPayAsYouUse ? 'text-blue-light' : 'text-gray-dark'
              )}
            >
              {plan.description}
            </p>
          </div>
          <div>
            <Button
              onClick={plan.buttonAction}
              variant="outline"
              className={cn(
                'w-fit',
                !isPayAsYouUse
                  ? 'text-blue-dark hover:bg-gray-200 hover:text-blue-700'
                  : 'border-gray-dark text-gray-dark'
              )}
            >
              {plan.buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
