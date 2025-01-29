'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Banknote,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  HelpCircle,
  History,
  LayoutDashboard,
  User2,
  Video,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { Logo } from '../common/logo';
import LogoutButton from '../common/logout-button';
import { Separator } from '../ui/separator';

const SIDEBAR_LINKS = [
  { href: ROUTES.COMPLIANCE_GPT, icon: Bot, label: 'Compliance GPT' },
  { href: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { href: ROUTES.TUTORIALS, icon: Video, label: 'Tutorials' },
  { href: ROUTES.HISTORY, icon: History, label: 'History' },
];

const PROFILE_LINKS = [
  { href: ROUTES.PROFILE, icon: User2, label: 'My Profile' },
  { href: ROUTES.SUPSCRIPTION, icon: CircleDollarSign, label: 'Subscription' },
  { href: ROUTES.BILLING, icon: Banknote, label: 'Billing' },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderLinks = (
    links: {
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      label: string;
    }[]
  ) =>
    links.map(({ href, icon: Icon, label }) => (
      <Link
        key={label}
        href={href}
        className={cn(
          'w-full flex items-center px-4 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm text-gray-dark hover:text-blue-dark',
          { 'text-blue-dark': pathname === href }
        )}
      >
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Link>
    ));

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full w-[280px] flex-col bg-blue-light lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Button
          size="icon"
          variant="secondary"
          onClick={toggleSidebar}
          className={cn(
            'lg:hidden fixed top-5 z-50 rounded-full h-fit w-fit p-1.5',
            isOpen ? '-right-4 top-7' : '-right-10'
          )}
        >
          {isOpen ? (
            <ChevronLeft className="h-6 w-6" />
          ) : (
            <ChevronRight className="h-6 w-6" />
          )}
        </Button>

        <div className="p-6 pb-2">
          <div className="mb-8 border-b border-gray-dark pb-6">
            <Logo href={ROUTES.CHAT} />
          </div>
        </div>

        <div className="px-6 pb-4 flex flex-col justify-between flex-1">
          <div>
            {renderLinks(SIDEBAR_LINKS)}
            <Separator className="my-3 bg-gray-light" />
            {renderLinks(PROFILE_LINKS)}
          </div>

          <div>
            <Link
              href={ROUTES.HELP_CENTER}
              className={cn(
                'w-full flex items-center justify-start px-4 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm text-gray-dark hover:text-blue-dark',
                { 'text-blue-dark': pathname === ROUTES.HELP_CENTER }
              )}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Help Center
            </Link>
            <LogoutButton className="text-gray-dark hover:text-blue-dark" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
