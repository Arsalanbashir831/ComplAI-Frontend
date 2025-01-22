'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Command,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Search,
} from 'lucide-react';

import type { SidebarProps } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { Logo } from '../common/logo';
import { Input } from '../ui/input';

export function Sidebar({ recentChats }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-[#07378C80] shadow-lg shadow-[#07378C14] m-4 rounded-xl border-[2.5px]">
      <div className="p-6">
        <div className="mb-8 border-b pb-6 ">
          <Logo />
        </div>
        <div className="relative">
          <Input
            placeholder="Search for chats"
            startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            endIcon={
              <span className="flex gap-1 items-center bg-gray-light rounded text-black font-medium px-1.5 py-1 text-xs">
                <Command className="h-3 w-3" />
                <span className="font-mono">K</span>
              </span>
            }
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6">
        <h2 className="mb-4 text-lg font-semibold">Recent</h2>
        <div className="space-y-2">
          {recentChats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className="w-full justify-start text-left font-normal text-gray-dark "
            >
              <span>
                <MessageSquareText />
              </span>
              <span className="text-ellipsis overflow-hidden">
                {chat.message}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8 rounded-lg bg-primary p-3 text-primary-foreground gap-y-2 flex flex-col items-center query-limit-card relative">
          <h3 className="mb-1 font-semibold text-xs">
            Daily query limit is almost reached
          </h3>
          <Progress
            value={70}
            className="bg-white"
            indicatorClassName="bg-blue-dark"
          />
          <p className="mb-1 text-sm opacity-90 text-center">
            Enjoy working advances search experience and much more
          </p>
          <Button variant="secondary" className="w-3/4 text-primary">
            Upgrade
          </Button>
        </div>

        <div className="border-t pt-6">
          <Link
            href={ROUTES.DASHBOARD}
            className="w-full flex items-center justify-start px-4 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
