// src/app/chat/[id]/page.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChatContext } from '@/contexts/chat-context';

import { useClientOnly } from '@/lib/client-only';
import { useChatMessages } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

export default function SpecificChatPage() {
  const { id } = useParams();
  const chatId = id as string;

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [pagination, setPagination] = useState<{
    page_size: number;
    direction: string;
    has_next: boolean;
    count: number;
    next_cursor: string | null;
  } | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isClient = useClientOnly();

  const { messages, setMessages } = useChatContext();
  const { data: chatMessagesData, isLoading } = useChatMessages(chatId);

  // Initialize context messages and pagination when the page loads
  useEffect(() => {
    if (chatMessagesData?.results && messages.length === 0 && isClient) {
      setMessages(chatMessagesData.results);
      if (chatMessagesData.pagination) {
        setPagination({
          page_size: chatMessagesData.pagination.page_size,
          direction: chatMessagesData.pagination.direction,
          has_next: chatMessagesData.pagination.has_next,
          count: chatMessagesData.pagination.count,
          next_cursor: chatMessagesData.pagination.next_cursor ?? null,
        });
      }
    }
    // We only want this to run when the initial chatMessages are loaded.
    // Removing `messages` from the dependency array prevents it from re-running unnecessarily.
  }, [chatMessagesData, messages.length, setMessages, isClient]);

  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleLoadMore = async () => {
    if (!pagination?.has_next || !pagination?.next_cursor) return;

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
        setMessages((prev) => [...newMessages, ...prev]);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    }
  };

  return (
    // Use a flex column layout that takes up the full screen height
    <div className="flex flex-col h-screen">
      <ChatHeader currentChatId={chatId} />

      {/* This main area will contain the messages and the input */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {/*
          The ChatMessages component will now be responsible for its own scrolling.
          flex-1 allows it to take up all available vertical space.
          overflow-y-auto will create a scrollbar only when needed.
        */}
        <div className="flex-1 overflow-y-auto px-6 pt-4">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            chatId={chatId}
            containerRef={
              messagesContainerRef as React.RefObject<HTMLDivElement>
            }
            onScrollButtonVisible={setShowScrollButton}
            hasMore={pagination?.has_next ?? false}
            onLoadMore={handleLoadMore}
          />
        </div>

        {/* The MessageInput component is pinned to the bottom */}
        <div className="px-6 pb-4">
          <div className="mx-auto md:max-w-[80%] w-full">
            <MessageInput
              chatId={chatId}
              showScrollButton={showScrollButton}
              onScrollToBottom={scrollToBottom}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
