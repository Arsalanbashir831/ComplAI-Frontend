'use client';


import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { useChatContext } from '@/contexts/chat-context';
import { useChat } from '@/hooks/useChat';
import useUserData from '@/hooks/useUserData';
import type { PromptCardProps } from '@/types/chat';

export function PromptCard({ icon, title, className }: PromptCardProps) {
  const { sendMessage, createChat } = useChat();
 const {setMessages}=  useChatContext()
 const {data:user} = useUserData()
  const router = useRouter();
 // const { setLoading } = useLoader();
  const handleClick = async () => {
    const response = await createChat(title);
    const chatId = response.id;
    setMessages([])
    router.push(`/chat/${chatId}`);
    //setLoading(true);
    // Create a user message and add it to the context.
    const userMessage = {
      id: Date.now(),
      chat: Number(chatId),
      user: user?.username || 'You',
      content: title.trim(),
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: false,
      file: null,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create a placeholder AI message.
    const aiMessageId = Date.now() + 1;
    const placeholderAIMessage = {
      id: aiMessageId,
      chat: Number(chatId),
      user: 'AI',
      content: '',
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: true,
      file: null,
    };
    setMessages((prev) => [...prev, placeholderAIMessage]);


     await sendMessage({
      chatId: chatId,
      content: title.trim(),
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
