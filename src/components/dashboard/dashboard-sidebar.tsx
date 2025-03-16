'use client';

import { ROUTES } from '@/constants/routes';
import {
  Banknote,
  CircleDollarSign,
  HelpCircle,
  History,
  LayoutDashboard,
  User2,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Logo } from '../common/logo';
import LogoutButton from '../common/logout-button';
import MenuToggleButton from '../common/menu-toggle-button';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const SIDEBAR_LINKS = [
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
const router = useRouter()
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
        <MenuToggleButton isOpen={isOpen} toggleSidebar={toggleSidebar} />

        <div className="p-6 pb-0">
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

          <div className="py-4">
            <div className=" pb-4">
              <div className="mb-6 rounded-lg bg-primary p-3 text-primary-foreground gap-y-2 flex flex-col items-center query-limit-card relative">
                <h3 className="mb-1 font-semibold text-xl">Compliance AI</h3>
                <p className="mb-1 text-sm opacity-90 text-center">
                  Return to AI Chat
                </p>
                <Button
                onClick={()=>router.push(ROUTES.CHAT)}
                  variant="secondary"
                  className="w-3/4 text-primary cursor-pointer z-10"
                >
                 Use Compl-AI
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <Link
                href={ROUTES.HELP_CENTER}
                className={cn(
                  'w-full flex items-center px-4 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm text-gray-dark hover:text-blue-dark',
                  { 'text-blue-dark': pathname === ROUTES.HELP_CENTER }
                )}
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                Contact Us
              </Link>

              <LogoutButton className="text-gray-dark hover:text-blue-dark" />
            </div>
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
