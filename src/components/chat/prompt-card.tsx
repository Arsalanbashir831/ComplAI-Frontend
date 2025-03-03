'use client';

import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { useLoader } from '@/contexts/loader-context';
import { useChat } from '@/hooks/useChat';
import type { PromptCardProps } from '@/types/chat';

export function PromptCard({ icon, title, className }: PromptCardProps) {
  const { sendMessage, createChat } = useChat();
  const router = useRouter();
const {setLoading} = useLoader()
  const handleClick = async () => {
    const response = await createChat(title);
    const chatId = response.id;
setLoading(true)
    const res = await sendMessage({ chatId, content: title });
    if (res) {
      router.push(`/chat/${chatId}`);
    setLoading(false)
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
