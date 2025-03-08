import { ROUTES } from '@/constants/routes';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { ConfirmationModal } from './confirmation-modal';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const handleLogout = () => {
    router.push(ROUTES.LOGIN);
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          'w-full flex items-center justify-start px-5 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm',
          className
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Log out
      </Button>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Log out"
        description="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
}
