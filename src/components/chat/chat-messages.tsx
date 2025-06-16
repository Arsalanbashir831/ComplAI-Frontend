// src/components/chat/chat-messages.tsx

import { useEffect, useRef, useState } from 'react';
import { useChatContext } from '@/contexts/chat-context';
import { useSendMessageTrigger } from '@/contexts/send-message-trigger-context';
import { useUserContext } from '@/contexts/user-context';
import { ArrowDown } from 'lucide-react';

import type { ChatMessage } from '@/types/chat';

import { Button } from '../ui/button';
import { ChatBubble } from './chat-bubble';

// Pass isLoading prop to show a loading state for initial fetch
export function ChatMessages({
  messages,
  isLoading,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
}) {
  const { focusMessageId, setFocusMessageId } = useChatContext();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { trigger } = useSendMessageTrigger();

  useEffect(() => {
    // Priority #1: A new message has been sent and needs to be scrolled to the top.
    if (focusMessageId) {
      setTimeout(() => {
        const element = document.getElementById(`message-${focusMessageId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setFocusMessageId(null); // Reset after scrolling
      }, 0); // Defer to ensure DOM is updated
    } else {
      // Priority #2: Otherwise, handle auto-scrolling to the bottom for incoming AI messages.
      const shouldScrollDown = !showScrollButton || trigger;
      if (shouldScrollDown) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // This effect runs whenever messages or the trigger changes.
  }, [messages, trigger, focusMessageId, setFocusMessageId, showScrollButton]);

  // This useEffect now ONLY handles the IntersectionObserver setup.
  useEffect(() => {
    const bottomElement = bottomRef.current;
    const root = viewportRef.current;
    if (!bottomElement || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollButton(!entry.isIntersecting);
      },
      { root: root, threshold: 0.5 }
    );

    observer.observe(bottomElement);

    return () => observer.disconnect();
    // No dependency array needed, this is a one-time setup on mount.
  }, []);

  // Auto-scroll logic.
  useEffect(() => {
    const shouldScroll = !showScrollButton || trigger;
    if (shouldScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showScrollButton, trigger]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // This div is now the main scrolling container, passed from the parent page.
    <div ref={viewportRef} className="relative h-full">
      <div className="mx-auto md:max-w-[80%] md:p-4 min-h-full flex flex-col justify-end">
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

      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-10 bg-primary text-white h-fit p-4 rounded-full shadow-lg z-20"
        >
          <ArrowDown size={24} />
        </Button>
      )}
    </div>
  );
}
