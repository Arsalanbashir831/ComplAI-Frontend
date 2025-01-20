import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="mb-8 text-4xl font-bold">Welcome to Compl-AI</h1>
      <div className="space-y-4">
        <Button asChild className="w-full">
          <Link href={ROUTES.LOGIN}>Login</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={ROUTES.SIGN_UP}>Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
