'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatContext } from '@/contexts/chat-context';

import type { PromptCardProps } from '@/types/chat';
import { useChat, useChatMessages } from '@/hooks/useChat';
import useUserData from '@/hooks/useUserData';
import { Card, CardContent } from '@/components/ui/card';

export function PromptCard({ icon, title, className }: PromptCardProps) {
  const { sendMessage, createChat } = useChat();
  const { setMessages } = useChatContext();
  const { data: user } = useUserData();
  const router = useRouter();

  // Store the newly created chat ID.
  const [chatId, setChatId] = useState<string>('');

  // Initialize the hook with the current chat ID (or empty string if not set).
  const { refetch } = useChatMessages(chatId);

  const handleClick = async () => {
    // Create a new chat using the prompt title.
    const response = await createChat(title);
    const newChatId = response.id;
    setChatId(newChatId);
    setMessages([]);
    router.push(`/chat/${newChatId}`);

    // Create and add a user message.
    const userMessage = {
      id: Date.now(),
      chat: Number(newChatId),
      user: user?.username || 'You',
      content: title.trim(),
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: false,
      file: null,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create and add a placeholder AI message.
    const aiMessageId = Date.now() + 1;
    const placeholderAIMessage = {
      id: aiMessageId,
      chat: Number(newChatId),
      user: 'AI',
      content: '',
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: true,
      file: null,
    };
    setMessages((prev) => [...prev, placeholderAIMessage]);

    // Send the message. The onChunkUpdate callback updates the AI placeholder.
    await sendMessage({
      chatId: newChatId,
      content: title.trim(),
      onChunkUpdate: (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: chunk } : msg
          )
        );
      },
    });

    const refetchResult = await refetch();
    if (refetchResult.data) {
      setMessages(refetchResult.data);
    }
  };

  return (
    <Card
      className={`hover:bg-accent cursor-pointer transition-colors ${className}`}
      onClick={handleClick}
    >
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="mt-1 text-muted-foreground">{icon}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
