'use client';


import { Card, CardContent } from '@/components/ui/card';
import { usePrompt } from '@/contexts/prompt-context';
import type { PromptCardProps } from '@/types/chat';

export function PromptCard({ icon, title, className }: PromptCardProps) {
  const {setPromptText}= usePrompt()
 

  const handleClick =()=>{
setPromptText(title)
  }
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
