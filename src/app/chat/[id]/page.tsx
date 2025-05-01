'use client';

import { useParams } from 'next/navigation';

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

// import { useChatMessages } from '@/hooks/useChat';
// import { useEffect } from 'react';
// import { useChatContext } from '@/contexts/chat-context';

export default function SpecificChatPage() {
  const { id } = useParams();

  const chatId = id as string;

  // const { data: chatMessages } = useChatMessages(chatId);
  // const { bubbles , setBubbles } = useChatContext();

  // const { data: chatMessages } = useChatMessages(chatId);
  // const { bubbles, setBubbles } = useChatContext();

  // useEffect(() => {
  //   if (chatMessages && bubbles.length === 0) {
  //     const initialBubbles = chatMessages.map((msg: ChatMessage) => (
  //       <ChatBubble key={msg.id} message={msg} />
  //     ));
  //     setBubbles(initialBubbles);
  //   }
  // }, [chatMessages, bubbles.length, setBubbles]);

  return (
    <>
      <ChatHeader currentChatId={chatId} />
      <div className="px-6 flex flex-col justify-center h-[90%]">
        <ChatMessages chatId={chatId} />
        <div className="mx-auto md:max-w-[80%] w-full">
          <MessageInput chatId={chatId} />
        </div>
      </div>
    </>
  );
}
