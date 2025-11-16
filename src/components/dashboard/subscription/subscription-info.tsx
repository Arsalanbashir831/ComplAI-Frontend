import { Button } from '@/components/ui/button';

interface SubscriptionInfoProps {
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  onCancelSubscription: () => void;
  onRenewSubscription: () => void;
  isCancelling: boolean;
  isRenewing: boolean;
  rawStartDate?: string; // ISO date from API
}

export function SubscriptionInfo({
  plan,
  startDate,
  endDate,
  status,
  cancelAtPeriodEnd,
  onCancelSubscription,
  onRenewSubscription,
  isCancelling,
  isRenewing,
  rawStartDate,
}: SubscriptionInfoProps) {
  const isFree = plan === 'free';
  const isActive = status === 'active' && !cancelAtPeriodEnd;
  const isCancelled = cancelAtPeriodEnd || status === 'cancel_pending';

  // Calculate renewal date (1 year from start date) when subscription is active
  const getRenewalDate = () => {
    if (!rawStartDate) return endDate;
    
    try {
      const start = new Date(rawStartDate);
      const renewal = new Date(start);
      renewal.setFullYear(renewal.getFullYear() + 1);
      
      return renewal.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error calculating renewal date:', error);
      return endDate;
    }
  };

  const displayDate = isActive ? getRenewalDate() : endDate;

  console.log('SubscriptionInfo render:', {
    status,
    cancelAtPeriodEnd,
    isActive,
    isCancelled,
    isFree,
    rawStartDate,
    displayDate,
  });

  return (
    <section className="w-full bg-white px-8 py-10">
      <h2 className="text-3xl font-semibold text-blue-800 mb-6">
        Current Subscription
      </h2>

      <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6 mb-8">
        <div>
          <dt className="text-sm font-medium text-gray-600">Subscription</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize">
            {isFree ? 'Top-Up and Go' : 'Professional'}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-600">Started On</dt>
          <dd className="mt-1 text-lg text-gray-900">{startDate}</dd>
        </div>

        {!isFree && (
          <div>
            <dt className="text-sm font-medium text-gray-600">
              {isActive ? 'Renewal Date' : 'End Date'}
            </dt>
            <dd className="mt-1 text-lg text-gray-900">{displayDate}</dd>
          </div>
        )}

        {!isFree && (
          <div>
            <dt className="text-sm font-medium text-gray-600">Status</dt>
            <dd className="mt-1 text-lg text-gray-900 capitalize">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-green-500 text-white'
                    : isCancelled
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                }`}
              >
                {isActive
                  ? 'Active'
                  : isCancelled
                    ? 'Cancellation Pending'
                    : 'Inactive'}
              </span>
            </dd>
          </div>
        )}
      </dl>

      {!isFree && (
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {isActive
                ? 'Cancel your subscription at any time. Your access will continue until the end of the current billing period.'
                : isCancelled
                  ? 'Your subscription is cancelled and will end at the end of the current billing period. You can undo this action.'
                  : 'Your subscription is not currently active.'}
            </p>
          </div>

          {isActive ? (
            <Button
              variant="destructive"
              onClick={() => {
                console.log('Cancel button clicked');
                onCancelSubscription();
              }}
              disabled={isCancelling}
              className="min-w-[160px]"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          ) : isCancelled ? (
            <Button
              variant="outline"
              className="text-white bg-blue-600 hover:bg-blue-700 min-w-[160px]"
              onClick={() => {
                console.log('Undo cancellation button clicked');
                onRenewSubscription();
              }}
              disabled={isRenewing}
            >
              {isRenewing ? 'Renewing...' : 'Undo Cancellation'}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
