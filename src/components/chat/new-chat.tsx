import { ClipboardList, Mail, ShieldCheck, UserRound } from 'lucide-react';

import { PromptCard as PromptCardType } from '@/types/chat';
import { MessageInput } from '@/components/chat/message-input';
import { PromptCard } from '@/components/chat/prompt-card';

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

export default function NewChat() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 flex flex-col justify-center h-full">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-[#020F26] to-[#07378CE5] bg-clip-text text-transparent">
          Hi there, John
        </h1>
        <h2 className="mb-4 text-4xl font-bold bg-gradient-to-r from-[#020F26] to-[#07378CE5] bg-clip-text text-transparent">
          How can we help?
        </h2>

        <p className="text-gray-dark">
          Use one of the most common prompts below or use your own to begin
        </p>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-4">
        {promptCards.map((card) => (
          <PromptCard key={card.id} {...card} />
        ))}
      </div>

      <MessageInput isNewChat={true} />
    </div>
  );
}
