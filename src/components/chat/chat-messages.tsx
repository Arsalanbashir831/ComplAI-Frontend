import { useEffect, useRef } from 'react';
import { useUserContext } from '@/contexts/user-context';

import type { ChatMessage } from '@/types/chat';

import { ScrollArea } from '../ui/scroll-area';
import { ChatBubble } from './chat-bubble';

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="mx-auto md:max-w-[80%] md:p-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} user={user} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
