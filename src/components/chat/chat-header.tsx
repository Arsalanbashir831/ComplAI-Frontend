'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuthority } from '@/contexts/authority-context';
import { Plus, Trash2 } from 'lucide-react';

import { AUTHORITY_OPTIONS } from '@/types/chat';
import {
  getAuthorityColor,
  getAuthorityOptionColor,
  getAuthorityTextColor,
} from '@/lib/utils';
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

interface ChatHeaderProps {
  currentChatId: string;
}

export function ChatHeader({ currentChatId }: ChatHeaderProps) {
  const { deleteChat } = useChat();
  const {
    selectedAuthority,
    setSelectedAuthority,
    isAuthorityLocked,
    isAuthorityLoading,
  } = useAuthority();
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
                      setSelectedAuthority(value as 'SRA' | 'LAA' | 'AML')
                    }
                    disabled={isAuthorityLocked}
                  >
                    <SelectTrigger
                      className={`h-8 text-xs font-medium border transition-all duration-150 rounded-md px-3 ${getAuthorityColor(selectedAuthority)} ${isAuthorityLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <SelectValue placeholder="Select Companion" />
                    </SelectTrigger>
                    <SelectContent className="w-[350px] border border-gray-200 shadow-lg rounded-md bg-white">
                      {AUTHORITY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className={`text-xs px-3 py-2 cursor-pointer rounded-sm ${getAuthorityOptionColor(option.value)}`}
                        >
                          <span
                            className={`font-medium ${getAuthorityTextColor(option.value)}`}
                          >
                            {option.label}
                          </span>
                          <span
                            className={`ml-1 ${getAuthorityTextColor(option.value)}`}
                          >
                            ({option.abbreviation})
                          </span>
                        </SelectItem>
                      ))}
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
