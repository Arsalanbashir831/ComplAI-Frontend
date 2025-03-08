import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SubscriptionInfoProps {
  plan: string;
  startDate: string;
  // renewalDate: string;
  autoRenew: boolean;
  onAutoRenewChange: () => void;
}

export function SubscriptionInfo({
  plan,
  startDate,
  // renewalDate,
  autoRenew,
  onAutoRenewChange,
}: SubscriptionInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Current Subscription</h2>
        <div className="flex gap-2 text-sm">
          <span className="">Subscription:</span>
          <span className="capitalize">
            {plan === 'subscription' ? 'Premium Plan' : 'Free'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="">Started on:</span>
          <span>{startDate}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="">Contract Period:</span>
          <span>12 Months</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-4">
            <Label htmlFor="auto-renew" className="text-2xl font-semibold">
              Enable auto Renew
            </Label>
            <Switch
              id="auto-renew"
              checked={autoRenew}
              className="data-[state=unchecked]:bg-gray-400 mt-1.5"
              onCheckedChange={onAutoRenewChange}
            />
          </div>
          <div className="text-sm">
            Automatically renew your subscription before it expires, ensuring
            uninterrupted service.
          </div>
        </div>
      </div>
    </div>
  );
}
