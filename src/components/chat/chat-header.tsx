'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Plus, Trash2 } from 'lucide-react';

import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';

import { ConfirmationModal } from '../common/confirmation-modal';

interface ChatHeaderProps {
  currentChatId: string;
}

export function ChatHeader({ currentChatId }: ChatHeaderProps) {
  const { deleteChat } = useChat();
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
    <header className="flex justify-end md:justify-between items-center py-4 md:px-4 border-b-gray-100 border-b-2">
      {/* Logo Section */}
      <div className="items-center space-x-2 hidden md:flex">
        <Image src="/robot_icon.png" alt="Compl-AI-v1" width={40} height={40} />
        <h1 className="text-xl font-semibold text-gray-800">Companion-v1</h1>
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
