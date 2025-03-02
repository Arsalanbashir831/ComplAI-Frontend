'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';
import { useChat, useChatMessages } from '@/hooks/useChat';
import type { ChatMessage } from '@/types/chat';

// Type guard to check if value is a File
function isFile(value: unknown): value is File {
  return typeof value === 'object' && value !== null && (value as File).name !== undefined;
}

// Type guard to check if value is a Blob
function isBlob(value: unknown): value is Blob {
  return typeof value === 'object' && value !== null && 'size' in value && 'type' in value;
}

export default function SpecificChatPage() {
  const { id } = useParams();
  const chatId = id as string;

  const { data: chatMessages } = useChatMessages(chatId);
  const { sendMessage, addMessageNoStream } = useChat();

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

  const handleNoStreamMessage = async (
    chatId: string,
    content: string,
    document?: File,
    return_type?: string
  ) => {
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

    // Placeholder AI message with loading text
    const aiMessageId = Date.now() + 1;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      chat: Number(chatId),
      user: 'AI',
      content: 'Creating File for you...',
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: true,
      file: null,
    };
    setMessages((prev) => [...prev, aiMessage]);

    const validReturnType =
      return_type === 'docx' || return_type === 'pdf' ? return_type : undefined;
    const response = await addMessageNoStream({
      chatId,
      content,
      document,
      return_type: validReturnType,
    });

    let finalMessage: ChatMessage = response;

    // If response.file exists and isn't already a File, try converting it
    if (response.file && !isFile(response.file)) {
      if (isBlob(response.file)) {
        finalMessage = {
          ...response,
          file: new File([response.file], 'download', {
            type: (response.file as Blob).type || 'application/octet-stream',
          }),
        };
      }
    }

    // Update the placeholder AI message with the final message
    setMessages((prev) =>
      prev.map((msg) => (msg.id === aiMessageId ? finalMessage : msg))
    );
  };

  return (
    <>
      <ChatHeader currentChatId={chatId} />

      <div className="px-6 flex flex-col justify-center h-[90%]">
        <ChatMessages messages={messages} />
        <div className="mx-auto md:max-w-[80%] w-full">
          <MessageInput
            chatId={chatId}
            onSendMessage={handleSendMessage}
            noStreamSendMessage={handleNoStreamMessage}
          />
        </div>
      </div>
    </>
  );
}
