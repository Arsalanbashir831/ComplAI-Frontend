'use client';

import { ResolverSidebar } from '@/components/resolver/resolver-sidebar';

/**
 * Resolver Layout
 *
 * Provides the layout structure for all resolver-related pages.
 * Includes the sidebar navigation for complaint management.
 */
export default function ResolverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ResolverSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
