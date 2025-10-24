'use client';

import { useClientOnly } from '@/lib/client-only';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders its children on the client side
 * This prevents hydration mismatches for components that depend on browser APIs
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const isClient = useClientOnly();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
