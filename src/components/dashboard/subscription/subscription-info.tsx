import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SubscriptionInfoProps {
  plan: string;
  startDate: string;
  renewalDate: string;
  autoRenew: boolean;
  onAutoRenewChange: (enabled: boolean) => void;
}

export function SubscriptionInfo({
  plan,
  startDate,
  renewalDate,
  autoRenew,
  onAutoRenewChange,
}: SubscriptionInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Current Subscription</h2>
        <div className="flex gap-2 text-sm">
          <span className="">Subscription:</span>
          <span>{plan}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="">Started at:</span>
          <span>{startDate}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="">Renewal Date:</span>
          <span>{renewalDate}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="auto-renew" className="text-2xl font-semibold">
            Enable auto Renew
          </Label>
          <div className="text-sm">
            Automatically renew your subscription before it expires, ensuring
            uninterrupted service.
          </div>
        </div>
        <Switch
          id="auto-renew"
          checked={autoRenew}
          onCheckedChange={onAutoRenewChange}
        />
      </div>
    </div>
  );
}
