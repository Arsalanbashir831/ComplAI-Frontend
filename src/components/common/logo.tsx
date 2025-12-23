import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  outsideDomain?: boolean;
  className?: string;
}

export function Logo({
  href = ROUTES.LANDINGPAGE,
  outsideDomain = false,
  className,
}: LogoProps) {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL;
  if (outsideDomain && landingUrl) {
    return (
      <a
        href={landingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('flex items-center justify-center', className)}
      >
        <Image
          src="/logo.svg"
          alt={siteConfig.name}
          width={150}
          height={150}
          priority
        />
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={cn('flex items-center justify-center', className)}
    >
      <Image
        src="/logo.svg"
        alt={siteConfig.name}
        width={150}
        height={150}
        priority
      />
    </Link>
  );
}
