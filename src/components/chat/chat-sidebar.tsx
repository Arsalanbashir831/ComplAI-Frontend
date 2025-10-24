'use client';

import { ROUTES } from '@/constants/routes';
import { LayoutDashboard, MessageSquareText, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';

import { Logo } from '../common/logo';
import LogoutButton from '../common/logout-button';
import MenuToggleButton from '../common/menu-toggle-button';
import { Input } from '../ui/input';

export function ChatSidebar() {
  const { chats, isLoading, error } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  // For client-side filtering
  const [searchTerm, setSearchTerm] = useState('');

  // For infinite scrolling
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [pagination, setPagination] = useState<{
    page_size: number;
    direction: string;
    has_next: boolean;
    count: number;
    next_cursor: string | null;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const currentChatId = pathname.split('/').pop();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Initialize chats when they're first loaded
  useEffect(() => {
    if (chats && Array.isArray(chats) && allChats.length === 0) {
      // Ensure unique chats by ID to prevent duplicates
      const uniqueChats = chats.filter(
        (chat, index, self) => index === self.findIndex((c) => c.id === chat.id)
      );
      setAllChats(uniqueChats);
      // Set initial pagination state
      setPagination({
        page_size: 20,
        direction: 'desc',
        has_next: true,
        count: uniqueChats.length,
        next_cursor:
          uniqueChats.length > 0
            ? uniqueChats[uniqueChats.length - 1].updated_at
            : null,
      });
    }
  }, [chats, allChats.length]);

  // Load more chats function
  const loadMoreChats = useCallback(async () => {
    if (loadingMore || !pagination?.has_next || !pagination?.next_cursor)
      return;

    setLoadingMore(true);
    try {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/user/`
      );
      url.searchParams.set('cursor', pagination.next_cursor);
      url.searchParams.set('direction', pagination.direction);
      url.searchParams.set('page_size', pagination.page_size.toString());

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          // Invalid cursor format, reset to first page
          console.warn('Invalid cursor format, resetting pagination');
          setPagination((prev) => (prev ? { ...prev, has_next: false } : null));
          return;
        }
        throw new Error('Failed to load more chats');
      }

      const data = await response.json();
      const newChats = data.results || [];

      if (newChats.length === 0) {
        setPagination((prev) => (prev ? { ...prev, has_next: false } : null));
      } else {
        setAllChats((prev) => {
          // Filter out any chats that already exist to prevent duplicates
          const existingIds = new Set(prev.map((chat: Chat) => chat.id));
          const uniqueNewChats = newChats.filter(
            (chat: Chat) => !existingIds.has(chat.id)
          );
          return [...prev, ...uniqueNewChats];
        });
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error loading more chats:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, pagination]);

  // Handle scroll event for infinite loading
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // Load when 100px from bottom

    if (isNearBottom && pagination?.has_next && !loadingMore) {
      loadMoreChats();
    }
  }, [pagination?.has_next, loadingMore, loadMoreChats]);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Filter chats based on search term
  const filteredChats = allChats
    .filter(
      (chat): chat is Chat =>
        chat &&
        typeof chat === 'object' &&
        'name' in chat &&
        typeof chat.name === 'string'
    ) // Ensure valid chat objects
    .filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Sort the filtered chats with validation
  const sortedChats = filteredChats
    .filter((chat) => 'updated_at' in chat && chat.updated_at) // Ensure updated_at exists
    .sort((a, b) => {
      try {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      } catch {
        return 0; // Return 0 if date comparison fails
      }
    });
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
            <Logo href={ROUTES.LANDINGPAGE} />
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

        <div ref={scrollContainerRef} className="flex-1 overflow-auto px-6">
          {/* 3. Show heading based on searchTerm. */}
          <h2 className="mb-4 text-lg font-semibold">
            {searchTerm ? 'Search Results' : 'Recent'}
          </h2>
          <div className="space-y-2">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              // Error message
              <div className="text-center text-red-500 py-4">
                Failed to load chats: {error.message}
              </div>
            ) : sortedChats && sortedChats.length > 0 ? (
              // Chat list
              <>
                {sortedChats.map((chat) => (
                  <React.Fragment key={chat.id}>
                    <Button
                      onClick={() =>
                        (window.location.href = ROUTES.CHAT_ID(String(chat.id)))
                      }
                      variant="ghost"
                      className={cn(
                        'w-full justify-start text-left font-normal text-gray-dark',
                        currentChatId === String(chat.id) &&
                          'bg-accent text-black'
                      )}
                    >
                      <MessageSquareText />
                      <span className="text-ellipsis overflow-hidden">
                        {chat.name}
                      </span>
                    </Button>
                  </React.Fragment>
                ))}

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}

              </>
            ) : (
              // No chats message
              <div className="text-center text-gray-500 py-4">
                No chats found
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pb-4">
          {/* <div className="mb-6 rounded-lg bg-primary p-3 text-primary-foreground gap-y-2 flex flex-col items-center query-limit-card relative z-10">
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
          </div> */}

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
