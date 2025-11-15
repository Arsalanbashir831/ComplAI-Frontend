'use client';

import { ClipboardList, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

import { MessageInput } from '@/components/chat/message-input';
import { PromptCard } from '@/components/chat/prompt-card';
import DisplayUsername from '@/components/common/display-username';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useAuthorityActions,
  useSelectedAuthority,
  useShouldOpenDropdown,
} from '@/stores/authority-store';
import { AUTHORITY_OPTIONS, PromptCard as PromptCardType } from '@/types/chat';

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
  // Use Zustand store with optimized selectors
  const selectedAuthority = useSelectedAuthority();
  const shouldOpenDropdown = useShouldOpenDropdown();
  const { setSelectedAuthority, resetAuthority, clearDropdownTrigger } =
    useAuthorityActions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Reset authority to null when landing on new chat page
  // Zustand handles this cleanly without re-render issues
  useEffect(() => {
    console.log('🔄 [ChatPage] Resetting authority to null');
    resetAuthority();
  }, [resetAuthority]);

  // Watch for trigger to open dropdown (e.g., when user tries to send without selecting)
  useEffect(() => {
    console.log('👀 [ChatPage] shouldOpenDropdown changed:', shouldOpenDropdown);
    console.log('📊 [ChatPage] Current dropdown state:', isDropdownOpen);
    
    if (shouldOpenDropdown) {
      console.log('✅ [ChatPage] Trigger detected! Opening dropdown with pulse effect...');
      setIsDropdownOpen(true);
      setShouldPulse(true);
      clearDropdownTrigger();
      
      console.log('💫 [ChatPage] Dropdown opened, pulse animation started');
      
      // Remove pulse animation after it completes
      setTimeout(() => {
        setShouldPulse(false);
        console.log('✨ [ChatPage] Pulse animation completed');
      }, 1000);
    }
  }, [shouldOpenDropdown, clearDropdownTrigger, isDropdownOpen]);

  // Log state changes
  useEffect(() => {
    console.log('📊 [ChatPage] State Update:', {
      isDropdownOpen,
      selectedAuthority,
      shouldPulse,
      shouldOpenDropdown,
    });
  }, [isDropdownOpen, selectedAuthority, shouldPulse, shouldOpenDropdown]);

  // Handle dropdown open/close state changes
  const handleDropdownOpenChange = (open: boolean) => {
    console.log(`🔀 [ChatPage] Dropdown state changing: ${isDropdownOpen} → ${open}`);
    setIsDropdownOpen(open);
    // Clear pulse when user manually interacts with dropdown
    if (open && shouldPulse) {
      console.log('🛑 [ChatPage] Clearing pulse effect (user interaction)');
      setShouldPulse(false);
    }
  };

  const handleSelectAuthority = (value: string) => {
    console.log('🎯 [ChatPage] Authority selected:', value);
    setSelectedAuthority(value as typeof AUTHORITY_OPTIONS[number]['value']);
    // Keep the dropdown open after selection
    setTimeout(() => {
      console.log('🔓 [ChatPage] Keeping dropdown open after selection');
      setIsDropdownOpen(true);
    }, 0);
  };

  return (
    <div className="relative h-full">
      {/* Authority Selection - Top Left Corner */}
      <div className="absolute top-4 left-4 z-10">
        <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
          <DropdownMenuTrigger
            className={`h-9 text-sm font-medium text-blue-800 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-100 transition-all duration-150 rounded-lg px-4 border border-gray-300 shadow-sm min-w-[280px] text-left flex items-center justify-between ${
              shouldPulse ? 'animate-pulse ring-2 ring-blue-400' : ''
            }`}
          >
            <span className={selectedAuthority ? '' : 'text-gray-500'}>
              {selectedAuthority
                ? AUTHORITY_OPTIONS.find((opt) => opt.value === selectedAuthority)
                    ?.label
                : 'Select Framework'}
            </span>
            <svg
              className="h-4 w-4 ml-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[350px] border border-gray-200 rounded-lg bg-white shadow-lg">
            {AUTHORITY_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSelectAuthority(option.value)}
                className="text-sm px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer rounded-md transition-colors"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-blue-800">
                    {option.label}
                  </span>
                  <span className="text-gray-500 text-xs ml-3">
                    ({option.abbreviation})
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
