// src/components/chat/chat-messages.tsx

import { useUserContext } from '@/contexts/user-context';
import { useSendMessageTrigger } from '@/stores/chat-store';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useClientOnly } from '@/lib/client-only';
import type { ChatMessage } from '@/types/chat';

import { ChatBubble } from './chat-bubble';

// Pass isLoading prop to show a loading state for initial fetch
export function ChatMessages({
  messages,
  isLoading,
  chatId,
  containerRef,
  onScrollButtonVisible,
  hasMore = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  onLoadMore,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  chatId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onScrollButtonVisible: (show: boolean) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}) {
  const viewportRef = containerRef;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();
  const trigger = useSendMessageTrigger();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<{
    page_size: number;
    direction: string;
    has_next: boolean;
    count: number;
    next_cursor: string | null;
  } | null>(null);
  const previousScrollHeight = useRef<number>(0);
  const isClient = useClientOnly();

  useEffect(() => {
    // Only scroll when a new message is sent (trigger is true) and on client side
    if (trigger && isClient) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
    // This effect runs whenever trigger changes.
  }, [trigger, isClient]);

  // Ensure messages is an array
  const messagesArray = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    // Scroll to bottom when chatId changes and messages are loaded (only on client)
    if (chatId && messagesArray.length > 0 && !isLoadingMore && isClient) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [chatId, messagesArray.length, isLoadingMore, isClient]);

  // Load older messages function
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingMore || !pagination?.has_next || !pagination?.next_cursor)
      return;

    setIsLoadingMore(true);
    try {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}/messages/`
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
          // Invalid cursor format, reset pagination
          console.warn('Invalid cursor format, resetting pagination');
          setPagination((prev) => (prev ? { ...prev, has_next: false } : null));
          return;
        }
        throw new Error('Failed to load older messages');
      }

      const data = await response.json();
      const newMessages = data.results || [];

      if (newMessages.length === 0) {
        setPagination((prev) => (prev ? { ...prev, has_next: false } : null));
      } else {
        // Prepend older messages to the beginning
        if (onLoadMore) {
          onLoadMore();
        }
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pagination, chatId, onLoadMore]);

  const handleScroll = () => {
    const el = viewportRef.current;
    if (!el) return;

    // Check if at bottom
    const atBottom =
      Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1;
    onScrollButtonVisible(!atBottom);

    // Check if scrolled to top to load more messages (WhatsApp style)
    if (el.scrollTop === 0 && pagination?.has_next && !isLoadingMore) {
      previousScrollHeight.current = el.scrollHeight;
      loadOlderMessages();
    }
  };

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (isLoadingMore && viewportRef.current) {
      const el = viewportRef.current;
      const newScrollHeight = el.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight.current;

      if (heightDifference > 0) {
        el.scrollTop = heightDifference;
        setIsLoadingMore(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesArray.length, isLoadingMore]);

  return (
    // This div is now the main scrolling container, passed from the parent page.
    <div
      ref={viewportRef}
      className="relative h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="mx-auto md:max-w-[85%] md:p-4 min-h-full flex flex-col justify-start">
        {/* Loading indicator at top when loading more messages */}
        <div ref={topRef} className="h-1">
          {isLoadingMore && (
            <div className="text-center text-gray-500 py-2">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              <span className="ml-2">Loading older messages...</span>
            </div>
          )}

          {/* Show load more indicator when there are more messages */}
          {pagination?.has_next && !isLoadingMore && (
            <div className="text-center text-gray-400 py-2 text-sm">
              Scroll up to load older messages
            </div>
          )}
        </div>

        {/* Optional: Show a loading skeleton/spinner during initial fetch */}
        {isLoading && messagesArray.length === 0 && (
          <div className="text-center text-gray-500">Loading messages...</div>
        )}

        {messagesArray.map((msg) => (
          <ChatBubble key={msg.id} message={msg} user={user} />
        ))}

        {/* This empty div marks the end of the chat list for scrolling */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
