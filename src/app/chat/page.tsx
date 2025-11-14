'use client';

import { useEffect, useState } from 'react';
import { useAuthority } from '@/contexts/authority-context';
import { ClipboardList, Mail, ShieldCheck, UserRound } from 'lucide-react';

import {
  AUTHORITY_OPTIONS,
  AuthorityValue,
  PromptCard as PromptCardType,
} from '@/types/chat';
import {
  getAuthorityColor,
  getAuthorityOptionColor,
  getAuthorityTextColor,
} from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageInput } from '@/components/chat/message-input';
import { PromptCard } from '@/components/chat/prompt-card';
import DisplayUsername from '@/components/common/display-username';

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
  const { selectedAuthority, setSelectedAuthority } = useAuthority();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Open dropdown by default when page loads and no authority is selected
  useEffect(() => {
    if (!selectedAuthority) {
      setIsDropdownOpen(true);
    }
  }, [selectedAuthority]);

  return (
    <div className="relative h-full">
      {/* Authority Selection - Top Left Corner */}
      <div className="absolute top-4 left-4 z-10">
        <Select
          value={selectedAuthority || undefined}
          onValueChange={(value) => {
            setSelectedAuthority(value as AuthorityValue);
            setIsDropdownOpen(false);
          }}
          open={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          <SelectTrigger
            className={`h-8 text-md font-medium border transition-all duration-150 rounded-md px-3 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 ${getAuthorityColor(selectedAuthority)}`}
          >
            <SelectValue placeholder="Select Companion" />
          </SelectTrigger>
          <SelectContent className="w-[350px] border border-gray-200 rounded-md bg-white outline-none focus:outline-none focus:ring-0 focus:ring-offset-0">
            {AUTHORITY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={`text-xs px-3 py-2 cursor-pointer rounded-sm outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 ${getAuthorityOptionColor(option.value)}`}
              >
                <span
                  className={`font-medium ${getAuthorityTextColor(option.value)}`}
                >
                  {option.label}
                </span>
                <span className={`ml-1 ${getAuthorityTextColor(option.value)}`}>
                  ({option.abbreviation})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 flex flex-col justify-center h-full">
        <ScrollArea className=" flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-gradient">
              Hi there, <DisplayUsername />
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
          <MessageInput
            isNewChat={true}
            showScrollButton={false}
            onScrollToBottom={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
