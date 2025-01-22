'use client';

import { useParams } from 'next/navigation';

import { useChat } from '@/hooks/chat-hook';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

export default function SpecificChatPage() {
  const { id } = useParams();

  const { chats } = useChat();

  const chat = chats[id as string];

  if (!chat) return <p>Chat not found</p>;

  return (
    <div className="mx-auto max-w-5xl px-6  flex flex-col justify-center h-full">
      <ChatHeader />

      <ChatMessages messages={chat.messages} />

      <MessageInput />
    </div>
  );
}
