import { useEffect, useRef } from 'react';

import type { ChatMessage } from '@/types/chat';

import { ScrollArea } from '../ui/scroll-area';
import { ChatBubble } from './chat-bubble';

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="h-[calc(100vh-2rem)] rounded-md ">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </ScrollArea>
  );
}
