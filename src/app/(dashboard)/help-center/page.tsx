// app/dashboard/help-support/page.tsx
'use client';

import DashboardHeader from '@/components/dashboard/dashboard-header';
import SupportForm from '@/components/dashboard/help-support/help-form-support';

export default function Page() {
  return (
    <>
      <div className="p-5 flex flex-col gap-y-5">
        <DashboardHeader title="" subtitle="" />

        <div>
          <SupportForm />
        </div>
      </div>
    </>
  );
}
