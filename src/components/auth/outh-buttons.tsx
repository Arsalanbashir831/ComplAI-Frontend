import Image from 'next/image';

import { Button } from '@/components/ui/button';

export function OAuthButtons() {
  return (
    <Button variant="outline" className="w-full justify-center gap-2">
      <Image src="/google.svg" alt="Google" width={20} height={20} />
      Continue with Google
    </Button>
  );
}
