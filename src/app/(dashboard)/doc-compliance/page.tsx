'use client'
// app/(dashboard)/doc-compliance/page.js
import dynamic from 'next/dynamic';

// export const dynamic = 'force-dynamic';
// // no “use client” here — this is a server component that
// // just loads your client component without SSR.

const DocComplianceClient = dynamic(
  () => import('@/components/dashboard/doc-compliance/DocComplianceClient'),
  { ssr: false }
);

export default function Page() {
  return <DocComplianceClient />;
}
