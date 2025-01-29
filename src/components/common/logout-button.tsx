import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const handleLogout = () => router.push(ROUTES.LOGIN);
  return (
    <Button
      variant="ghost"
      className={cn('w-full justify-start', className)}
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  );
}
