import { useUserContext } from '@/contexts/user-context';
import { useRef } from 'react';

import type { ChatMessage } from '@/types/chat';

import { ScrollArea } from '../ui/scroll-area';
import { ChatBubble } from './chat-bubble';

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();
  // const { trigger } = useSendMessageTrigger();

  // Auto-scroll whenever messages change (or a new send is triggered)
  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages, trigger]);

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="relative h-[calc(100vh-2rem)] overflow-y-auto"
    >
      <div className="mx-auto md:max-w-[80%] md:p-4">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} user={user} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
