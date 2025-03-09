import { useUserContext } from '@/contexts/user-context';
import { ArrowDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ChatMessage } from '@/types/chat';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { ChatBubble } from './chat-bubble';

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Use IntersectionObserver to detect if the bottom element is visible.
  // If it's not visible, we assume the user has scrolled up.
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    const bottomElement = bottomRef.current;
    if (!scrollContainer || !bottomElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the bottom is not in view, show the button.
        setShowScrollButton(!entry.isIntersecting);
      },
      {
        root: scrollContainer,
        threshold: 0.1,
      }
    );

    observer.observe(bottomElement);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Auto scroll when new messages arrive only if the user is at the bottom.
  useEffect(() => {
    if (!showScrollButton) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="relative h-[calc(100vh-2rem)] overflow-y-auto"
    >
      <div className="mx-auto md:max-w-[80%] md:p-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} user={user} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Display the button only if the bottom is out of view */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="fixed bottom-1/4 right-10 bg-primary text-white h-fit p-4 rounded-full shadow z-20"
        >
          <ArrowDown size={24} />
        </Button>
      )}
    </ScrollArea>
  );
}
