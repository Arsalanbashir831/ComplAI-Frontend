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
      className={cn(
        'w-full flex items-center justify-start px-5 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm',
        className
      )}
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-5 w-5" />
      Log out
    </Button>
  );
}
