'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  MessageSquareText,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import apiCaller from '@/config/apiCaller';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

import { Logo } from '../common/logo';
import LogoutButton from '../common/logout-button';
import MenuToggleButton from '../common/menu-toggle-button';
import { Input } from '../ui/input';

export function ChatSidebar() {
  const { chats } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  // For client-side filtering
  const [searchTerm, setSearchTerm] = useState('');

  const pathname = usePathname();
  const currentChatId = pathname.split('/').pop();

  type TokensSummary = {
    remaining_tokens: number;
    used_tokens: number;
    total_tokens: number;
  };

  const fetchTokensSummary = async (): Promise<TokensSummary> => {
    const response = await apiCaller(
      API_ROUTES.USER.GET_TOKENS_SUMMARY,
      'GET',
      {},
      {},
      true,
      'json'
    );
    return response.data;
  };

  const { data: tokensSummary } = useQuery({
    queryKey: ['tokensSummary'],
    queryFn: fetchTokensSummary,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Ensure non-negative token values
  const totalTokens = Math.max(tokensSummary?.total_tokens || 0, 0);
  const remainingTokens = Math.max(tokensSummary?.remaining_tokens || 0, 0);

  // Calculate progress percentage safely
  const progressValue =
    totalTokens > 0 ? ((totalTokens - remainingTokens) / totalTokens) * 100 : 0;

  // 1. Create a filtered array from the local `chats` state using client-side search
  const filteredChats = chats?.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedChats = filteredChats?.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  return (
    <div>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full w-[280px] flex-col bg-blue-light lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Toggle Button for Mobile */}
        <MenuToggleButton isOpen={isOpen} toggleSidebar={toggleSidebar} />

        <div className="p-6">
          <div className="mb-8 border-b border-gray-dark pb-6">
            <Logo href={ROUTES.CHAT} />
          </div>
          <div className="relative">
            {/* 2. Update searchTerm as the user types. */}
            <Input
              placeholder="Search for chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              // endIcon={
              //   <span className="flex gap-1 items-center bg-gray-light rounded text-black font-medium px-1.5 py-1 text-xs">
              //     <Command className="h-3 w-3" />
              //     <span className="font-mono">K</span>
              //   </span>
              // }
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6">
          {/* 3. Show heading based on searchTerm. */}
          <h2 className="mb-4 text-lg font-semibold">
            {searchTerm ? 'Search Results' : 'Recent'}
          </h2>
          <div className="space-y-2">
            {/* 4. Map over `filteredChats` instead of `chats`. */}
            {sortedChats?.map((chat) => (
              // <Link href={ROUTES.CHAT_ID(chat.id)} key={chat.id}>
              <>
                <Button
                  onClick={() =>
                    (window.location.href = ROUTES.CHAT_ID(chat.id))
                  }
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-left font-normal text-gray-dark',
                    currentChatId === String(chat.id) && 'bg-accent text-black'
                  )}
                >
                  <span>
                    <MessageSquareText />
                  </span>
                  <span className="text-ellipsis overflow-hidden">
                    {chat.name}
                  </span>
                </Button>
              </>
              // </Link>
            ))}
          </div>
        </div>

        <div className="p-6 pb-4">
          <div className="mb-6 rounded-lg bg-primary p-3 text-primary-foreground gap-y-2 flex flex-col items-center query-limit-card relative z-10">
            <h3 className="mb-1 font-semibold text-xs">
              {progressValue > 80
                ? 'Daily query limit is almost reached'
                : 'Here you can track your token usage'}
            </h3>
            <Progress
              value={progressValue}
              className="bg-white"
              indicatorClassName={cn(
                progressValue > 80 ? 'bg-red-500' : 'bg-green-500'
              )}
            />
            <p className="mb-1 text-sm opacity-90 text-center">
              Enjoy working with advanced search experience and much more
            </p>
            <Link href={ROUTES.SUPSCRIPTION} className="w-3/4 mx-auto block">
              <Button
                variant="secondary"
                className="w-full text-primary cursor-pointer z-10"
              >
                Upgrade
              </Button>
            </Link>
          </div>

          <div className="border-t pt-4">
            <Link
              href={ROUTES.DASHBOARD}
              className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm text-gray-dark hover:text-blue-dark"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <LogoutButton className="text-gray-dark hover:text-blue-dark" />
          </div>
        </div>
      </div>

      {/* Backdrop for Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
