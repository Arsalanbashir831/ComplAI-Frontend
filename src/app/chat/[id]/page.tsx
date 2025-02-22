'use client';

import { useParams } from 'next/navigation';

import { useChatMessages } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

export default function SpecificChatPage() {
  const { id } = useParams();
  console.log(id);

  const { data: chat } = useChatMessages(id as string);

  if (!chat) return <p>Chat not found</p>;

  return (
    <>
      <ChatHeader currentChatId={id as string} />

      <div className="px-6 flex flex-col justify-center h-[90%]">
        <ChatMessages messages={chat} />

        <div className="mx-auto md:max-w-[80%] w-full">
          <MessageInput chatId={id as string} />
        </div>
      </div>
    </>
  );
}
