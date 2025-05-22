import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SubscriptionInfoProps {
  plan: string;
  startDate: string;
  renewalDate: string;
  autoRenew: boolean;
  onAutoRenewChange: () => void;
}

export function SubscriptionInfo({
  plan,
  startDate,
  renewalDate,
  autoRenew,
  onAutoRenewChange,
}: SubscriptionInfoProps) {
  const isFree = plan === 'free';

  return (
    <section className="w-full bg-white px-8 py-10">
      <h2 className="text-3xl font-semibold text-blue-800 mb-6">Current Subscription</h2>

      <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6 mb-8">
        <div>
          <dt className="text-sm font-medium text-gray-600">Subscription</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize">
            {isFree ? 'Free' : 'Premium Plan'}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-600">Started On</dt>
          <dd className="mt-1 text-lg text-gray-900">{startDate}</dd>
        </div>

        {!isFree && (
          <div>
            <dt className="text-sm font-medium text-gray-600">Renewal Date</dt>
            <dd className="mt-1 text-lg text-gray-900">{renewalDate}</dd>
          </div>
        )}
      </dl>

      <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="auto-renew" className="text-lg font-medium text-gray-700">
            Auto Renew
          </Label>
          <Switch
            id="auto-renew"
            checked={autoRenew}
            onCheckedChange={isFree ? undefined : onAutoRenewChange}
            className="h-6 w-11 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
          />
        </div>

        <p className="text-sm text-gray-600">
          {isFree
            ? 'Upgrade to premium to enable auto-renew and ensure uninterrupted service.'
            : `Your subscription will automatically renew on ${renewalDate}.`}
        </p>
      </div>
    </section>
  );
}
