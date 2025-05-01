import { ArrowDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';


import { useChatContext } from '@/contexts/chat-context';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

import { useChatMessages } from '@/hooks/useChat';
import { ChatMessage } from '@/types/chat';
import { ChatBubble } from './chat-bubble';

export function ChatMessages({chatId}: { chatId: string }) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // const { user } = useUserContext();
  const [showScrollButton, setShowScrollButton] = useState(false);
  // const { trigger } = useSendMessageTrigger();
  const { bubbles,setBubbles } = useChatContext();
  // Use IntersectionObserver to detect if the bottom element is visible.
  // If it's not visible, we assume the user has scrolled up.
  const { data: chatMessages } = useChatMessages(chatId);
  

   useEffect(() => {
    if (chatMessages && bubbles.length === 0) {
      const initialBubbles = chatMessages.map((msg: ChatMessage) => (
        <ChatBubble key={msg.id} message={msg} />
      ));
      setBubbles(initialBubbles);
    }
  }, [chatMessages, bubbles.length, setBubbles]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollButton(!entry.isIntersecting),
      { root: scrollAreaRef.current, threshold: 0.1 }
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showScrollButton) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bubbles, showScrollButton]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="relative h-[calc(100vh-2rem)] overflow-y-auto"
    >
    <div className="mx-auto md:max-w-[80%] md:p-4 flex flex-col gap-3">
        {bubbles.map(b => b)}
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
