import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/config/site';

export function Logo() {
  return (
    <Link href="/" className="block">
      <Image
        src="/logo.png"
        alt={siteConfig.name}
        width={180}
        height={40}
        priority
      />
    </Link>
  );
}
