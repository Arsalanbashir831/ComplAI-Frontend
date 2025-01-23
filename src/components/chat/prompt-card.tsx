import type { PromptCardProps } from '@/types/chat';
import { Card, CardContent } from '@/components/ui/card';

export function PromptCard({ icon, title, className }: PromptCardProps) {
  return (
    <Card
      className={`hover:bg-accent cursor-pointer transition-colors ${className}`}
    >
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="mt-1 text-muted-foreground">{icon}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
