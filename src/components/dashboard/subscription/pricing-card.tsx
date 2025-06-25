import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/subscription';

interface PricingCardProps {
  plan: Plan;
  isActive?: boolean;
  isDisabled?: boolean;
}

export function PricingCard({ plan, isActive, isDisabled }: PricingCardProps) {
  const isFree = plan.type === 'free';

  console.log(plan.type + '' + isDisabled);
  return (
    <Card
      className={cn(
        'w-full h-full flex flex-col relative border rounded-2xl shadow-md transition-transform transform hover:scale-[1.02]',
        isActive ? 'border-blue-600' : 'border-gray-200',
        'bg-white'
      )}
    >
      {isActive && (
        <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-blue-700 p-3 rounded-full shadow-xl">
          <Check className="text-white w-5 h-5" />
        </div>
      )}

      {plan.special && (
        <div className="absolute -left-5 -top-5 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-sm font-semibold px-5 py-2 rounded-br-xl rounded-tl-xl shadow-xl">
          Recommended
        </div>
      )}

      <CardContent className="p-10 flex flex-col justify-between h-full">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-blue-800">
              {plan.title}
            </h3>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">
                {plan.minimumTerm} Minimum
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {plan.price}
                {plan.interval && (
                  <span className="text-base font-medium text-gray-500">
                    /{plan.interval}
                  </span>
                )}
              </div>
            </div>
          </div>

          {plan.description.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 text-left">
              <Check
                className={cn(
                  'h-4 w-4 shrink-0 mt-0.5 text-[#454545]'
                  // plan.color === 'blue' ? 'text-white' : 'text-[#454545]'
                )}
              />
              <span
                className={cn(
                  'text-sm text-[#454545]'
                  // plan.color === 'blue' ? 'text-blue-50' : 'text-[#454545]'
                )}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button
            onClick={plan.buttonAction}
            variant={isFree || plan.type === 'subscription' ? 'outline' : 'default'}
            disabled={isActive}
            className={cn(
              'w-full py-4 rounded-lg font-medium transition',
              (isFree || plan.type === 'subscription')
                ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {plan.special || isDisabled ? 'Subscribed' : plan.buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
