'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  useAuthorityActions,
  useIsAuthorityLoading,
  useIsAuthorityLocked,
  useSelectedAuthority,
} from '@/stores/authority-store';
import { Plus, Trash2 } from 'lucide-react';

import { AUTHORITY_OPTIONS } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { ConfirmationModal } from '../common/confirmation-modal';

// Authority color schemes
const AUTHORITY_COLORS = {
  SRA: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    hover: 'hover:bg-yellow-100',
    selectedBg: 'bg-yellow-100',
    selectedText: 'text-yellow-800',
    selectedBorder: 'border-yellow-400',
  },
  LAA: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-300',
    hover: 'hover:bg-green-100',
    selectedBg: 'bg-green-100',
    selectedText: 'text-green-800',
    selectedBorder: 'border-green-400',
  },
  AML: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-300',
    hover: 'hover:bg-blue-100',
    selectedBg: 'bg-blue-100',
    selectedText: 'text-blue-800',
    selectedBorder: 'border-blue-400',
  },
} as const;

interface ChatHeaderProps {
  currentChatId: string;
}

export function ChatHeader({ currentChatId }: ChatHeaderProps) {
  const { deleteChat } = useChat();
  const selectedAuthority = useSelectedAuthority();
  const isAuthorityLocked = useIsAuthorityLocked();
  const isAuthorityLoading = useIsAuthorityLoading();
  const { setSelectedAuthority } = useAuthorityActions();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!currentChatId) return;
    try {
      await deleteChat(currentChatId);

      router.push(ROUTES.CHAT);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <header className="flex justify-between md:justify-between items-center py-4 md:px-4 border-b-gray-100 border-b-2">
      {/* Logo and Authority Section */}
      <div className="items-center space-x-4 flex">
        <div className="items-center space-x-2 flex">
          <Image
            src="/robot_icon.png"
            alt="Compl-AI-v1"
            width={40}
            height={40}
          />
          <h1 className="text-xl font-semibold text-gray-800">Companion-v1</h1>
        </div>

        {/* Authority Selection */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {isAuthorityLoading ? (
                  <div className=" h-8 text-xs font-medium border-0 bg-gray-50 rounded-md px-3 py-2 flex items-center">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedAuthority || undefined}
                    onValueChange={(value) =>
                      setSelectedAuthority(
                        (value as (typeof AUTHORITY_OPTIONS)[number]['value']) ||
                          null
                      )
                    }
                    disabled={isAuthorityLocked}
                  >
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs font-medium border transition-all duration-150 rounded-md px-3',
                        selectedAuthority && AUTHORITY_COLORS[selectedAuthority]
                          ? `${AUTHORITY_COLORS[selectedAuthority].selectedBg} ${AUTHORITY_COLORS[selectedAuthority].selectedText} ${AUTHORITY_COLORS[selectedAuthority].selectedBorder} hover:opacity-90`
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100',
                        isAuthorityLocked && 'opacity-60 cursor-not-allowed',
                        'focus:ring-0 focus:bg-white focus:shadow-sm'
                      )}
                    >
                      <SelectValue placeholder="Select Framework" />
                    </SelectTrigger>
                    <SelectContent className="w-[350px] border border-gray-200 shadow-lg rounded-md bg-white p-2">
                      {AUTHORITY_OPTIONS.map((option) => {
                        const colors = AUTHORITY_COLORS[option.value];
                        const isSelected = selectedAuthority === option.value;

                        return (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className={cn(
                              'text-xs px-3 py-2 cursor-pointer rounded-md transition-all duration-200 mb-1',
                              isSelected
                                ? `${colors.selectedBg} ${colors.selectedText} ${colors.border} border-2`
                                : `${colors.bg} ${colors.text} ${colors.hover} border border-transparent`
                            )}
                          >
                            <span
                              className={cn(
                                'font-medium',
                                isSelected && 'font-semibold'
                              )}
                            >
                              {option.label}
                            </span>
                            <span
                              className={cn(
                                'ml-1 text-xs',
                                isSelected
                                  ? colors.selectedText
                                  : 'text-gray-500'
                              )}
                            >
                              ({option.abbreviation})
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </TooltipTrigger>
            {isAuthorityLocked && !isAuthorityLoading && (
              <TooltipContent className="bg-black">
                <p>
                  Chat Type is locked for this chat. Create a new chat to
                  change.
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <div className="border-r border-gray-light pr-4">
          <Button
            onClick={() => (window.location.href = ROUTES.CHAT)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-1 justify-center"
          >
            <Plus className="h-5 w-5" />
            <span>New Chat</span>
          </Button>
        </div>

        {/* Trash Icon */}
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg"
          aria-label="Delete"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <ConfirmationModal
        isOpen={open}
        onOpenChange={setOpen}
        title="Delete Confirmation"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
      />
    </header>
  );
}
