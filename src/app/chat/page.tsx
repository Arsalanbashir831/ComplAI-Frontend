import { ClipboardList, Mail, ShieldCheck, UserRound } from 'lucide-react';

import { MessageInput } from '@/components/chat/message-input';
import { PromptCard } from '@/components/chat/prompt-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PromptCard as PromptCardType } from '@/types/chat';

const promptCards: PromptCardType[] = [
  {
    id: '1',
    icon: <ClipboardList className="h-5 w-5" />,
    title: 'Write me a checklist for opening a new LAA Office',
  },
  {
    id: '2',
    icon: <Mail className="h-5 w-5" />,
    title: 'Generate an email to the Solicitors Regulation Authority',
  },
  {
    id: '3',
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'What are the key principles of Anti-money laundering?',
  },
  {
    id: '4',
    icon: <UserRound className="h-5 w-5" />,
    title: 'Generate a client care letter for our firm',
  },
];

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 flex flex-col justify-center h-full">
      <ScrollArea className=" flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gradient">
            Hi there, John
          </h1>
          <h2 className="mb-4 text-4xl font-bold text-gradient">
            How can I help?
          </h2>

          <p className="text-gray-dark">
            Use one of the most common prompts below or use your own to begin
          </p>
        </div>

        <div className="mb-36 md:mb-12 grid gap-4 sm:grid-cols-4">
          {promptCards.map((card) => (
            <PromptCard key={card.id} {...card} />
          ))}
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 px-4 md:px-0 md:static">
        <MessageInput isNewChat={true} />
      </div>
    </div>
  );
}
