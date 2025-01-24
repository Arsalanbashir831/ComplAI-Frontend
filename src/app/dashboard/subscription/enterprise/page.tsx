import DashboardHeader from '@/components/dashboard/dashboard-header';
import { EnterpriseForm } from '@/components/dashboard/subscription/enterprise-form';

export default function EnterpriceSubscriptionPage() {
  return (
    <div className="p-6 flex flex-col gap-y-8">
      <DashboardHeader title="Enterprise Subscription Form" />

      <EnterpriseForm />
    </div>
  );
}
