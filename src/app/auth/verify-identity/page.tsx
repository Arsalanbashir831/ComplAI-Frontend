import { Suspense } from 'react';

import { IdentityVerificationForm } from '@/components/auth/identity-verification';
import LoadingSpinner from '@/components/common/loading-spinner';

export default function VerifyIdentityPage() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <IdentityVerificationForm />
      </Suspense>
    </>
  );
}
