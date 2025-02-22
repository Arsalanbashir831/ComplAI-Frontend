'use client';

import { useRouter } from 'next/navigation';

import type { PromptCardProps } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { Card, CardContent } from '@/components/ui/card';

export function PromptCard({ icon, title, className }: PromptCardProps) {
  const { sendMessage, createChat } = useChat();
  const router = useRouter();

  const handleClick = async () => {
    const response = await createChat(title);
    const chatId = response.id;

    const res = await sendMessage({ chatId, content: title });
    if (res) {
      router.push(`/chat/${chatId}`);
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
