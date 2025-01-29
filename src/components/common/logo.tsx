import { ROUTES } from '@/constants/routes';
import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

export function Logo({ href = ROUTES.LANDINGPAGE }: { href?: string }) {
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
