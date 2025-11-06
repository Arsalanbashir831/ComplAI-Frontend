import { ROUTES } from '@/constants/routes';
import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

interface LogoProps {
  href?: string;
  outsideDomain?: boolean;
}

export function Logo({
  href = ROUTES.LANDINGPAGE,
  outsideDomain = false,
}: LogoProps) {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL;
  if (outsideDomain && landingUrl) {
    return (
      <a
        href={landingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center"
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
    <Link href={href} className="flex items-center justify-center">
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
