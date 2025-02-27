'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import type { ChatMessage } from '@/types/chat';
import { useChat, useChatMessages } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

export default function SpecificChatPage() {
  const { id } = useParams();
  const chatId = id as string;

  const { data: chatMessages } = useChatMessages(chatId);
  const { sendMessage } = useChat();

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize messages when API data is loaded
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  const handleSendMessage = async (content: string, document?: File) => {
    if (!content.trim() && !document) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      chat: Number(chatId),
      user: 'You',
      content,
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: false,
      file: document || null,
    };

    setMessages((prev) => [...prev, userMessage]);

    const aiMessageId = Date.now() + 1;

    const aiMessage: ChatMessage = {
      id: aiMessageId,
      chat: Number(chatId),
      user: 'AI',
      content: '',
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: true,
      file: null,
    };

    setMessages((prev) => [...prev, aiMessage]);

    await sendMessage({
      chatId,
      content,
      document,
      onChunkUpdate: (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: chunk } : msg
          )
        );
      },
    });
  };

  return (
    <>
      <ChatHeader currentChatId={chatId} />

      <div className="px-6 flex flex-col justify-center h-[90%]">
        <ChatMessages messages={messages} />
        <div className="mx-auto md:max-w-[80%] w-full">
          <MessageInput chatId={chatId} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </>
  );
}
