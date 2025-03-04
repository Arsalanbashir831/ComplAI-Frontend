import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '@/contexts/user-context';
import { ArrowDown } from 'lucide-react';

import type { ChatMessage } from '@/types/chat';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { ChatBubble } from './chat-bubble';

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor the visibility of the bottom element to show/hide the scroll-to-bottom button
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    const bottomElement = bottomRef.current;
    if (!scrollContainer || !bottomElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the bottom element is not intersecting with the scroll container's viewport, show the button.
        setShowScrollButton(!entry.isIntersecting);
      },
      {
        root: scrollContainer, // Use the scroll container as the viewport
        threshold: 0.1, // Adjust threshold as needed
      }
    );

    observer.observe(bottomElement);

    return () => {
      observer.disconnect();
    };
  }, []);

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

      {/* "Scroll to Bottom" button */}
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
