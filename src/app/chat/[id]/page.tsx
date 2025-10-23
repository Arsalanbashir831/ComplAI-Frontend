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
  const [currentPage, setCurrentPage] = useState(1);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isClient = useClientOnly();

  const { messages, setMessages } = useChatContext();
  const { data: chatMessagesData, isLoading } = useChatMessages(chatId);

  // Initialize context messages only once when the page loads and context is empty.
  useEffect(() => {
    if (chatMessagesData?.results && messages.length === 0 && isClient) {
      setMessages(chatMessagesData.results);
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

  const handleLoadMore = () => {
    // TODO: Implement pagination API call with page parameter
    // For now, this is a placeholder for when pagination endpoint is available
    console.log('Loading more messages for page:', currentPage + 1);
    setCurrentPage((prev) => prev + 1);
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
            hasMore={chatMessagesData?.pagination?.has_next ?? false}
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
