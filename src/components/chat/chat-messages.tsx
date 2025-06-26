// src/components/chat/chat-messages.tsx

import { useEffect, useRef } from 'react';
import { useSendMessageTrigger } from '@/contexts/send-message-trigger-context';
import { useUserContext } from '@/contexts/user-context';

import type { ChatMessage } from '@/types/chat';

import { ChatBubble } from './chat-bubble';

// Pass isLoading prop to show a loading state for initial fetch
export function ChatMessages({
  messages,
  isLoading,
  chatId,
  containerRef,
  onScrollButtonVisible,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  chatId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onScrollButtonVisible: (show: boolean) => void;
}) {
  const viewportRef = containerRef;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();
  const { trigger } = useSendMessageTrigger();

  useEffect(() => {
    // Only scroll when a new message is sent (trigger is true)
    if (trigger) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
    // This effect runs whenever trigger changes.
  }, [trigger]);

  useEffect(() => {
    // Scroll to bottom when chatId changes and messages are loaded
    if (chatId && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [chatId, messages.length]);

  const handleScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const atBottom =
      Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1;
    onScrollButtonVisible(!atBottom);
  };

  return (
    // This div is now the main scrolling container, passed from the parent page.
    <div
      ref={viewportRef}
      className="relative h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="mx-auto md:max-w-[90%] md:p-4 min-h-full flex flex-col justify-start">
        {/* Optional: Show a loading skeleton/spinner during initial fetch */}
        {isLoading && messages.length === 0 && (
          <div className="text-center text-gray-500">Loading messages...</div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} user={user} />
        ))}
        {/* This empty div marks the end of the chat list for scrolling */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
