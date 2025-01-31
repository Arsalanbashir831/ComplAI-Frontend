import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

type Props = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function MenuToggleButton({ isOpen, toggleSidebar }: Props) {
  return (
    <Button
      size="icon"
      variant="secondary"
      onClick={toggleSidebar}
      className={cn(
        'lg:hidden fixed top-5 z-50 rounded-full h-fit w-fit p-1.5 bg-blue-dark text-white hover:bg-blue-dark hover:text-white',
        isOpen ? '-right-4 top-7' : '-right-10'
      )}
    >
      {isOpen ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </Button>
  );
}
