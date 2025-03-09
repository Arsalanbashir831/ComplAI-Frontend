'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChatContext } from '@/contexts/chat-context';

import { useChatMessages } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

export default function SpecificChatPage() {
  const { id } = useParams();

  const chatId = id as string;
  const { messages, setMessages } = useChatContext();
  const { data: chatMessages } = useChatMessages(chatId);

  // Only initialize the context messages if the context is empty.
  useEffect(() => {
    if (chatMessages && messages.length === 0) {
      setMessages(chatMessages);
    }
  }, [chatMessages, messages, setMessages]);

  return (
    <>
      <ChatHeader currentChatId={chatId} />
      <div className="px-6 flex flex-col justify-center h-[90%]">
        <ChatMessages messages={messages} />
        <div className="mx-auto md:max-w-[80%] w-full">
          <MessageInput chatId={chatId} />
        </div>
      </div>
    </>
  );
}
