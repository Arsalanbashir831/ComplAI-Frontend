'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Plus, Settings, Trash2 } from 'lucide-react'; // Icons from Lucide React

import { Button } from '@/components/ui/button'; // ShadCN Button Component

export function ChatHeader() {
  return (
    <header className="flex justify-end md:justify-between items-center py-4 md:px-4">
      {/* Logo Section */}
      <div className="items-center space-x-2 hidden md:flex">
        <Image src="/favicon.svg" alt="Compl-AI-v1" width={40} height={40} />
        <h1 className="text-xl font-semibold text-gray-800">Compl-AI-v1</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <div className="border-r border-gray-light pr-4">
          <Link
            href={ROUTES.CHAT}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-1 justify-center"
          >
            <Plus className="h-5 w-5" />
            <span>New Chat</span>
          </Link>
        </div>

        {/* Settings Icon */}
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Trash Icon */}
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg"
          aria-label="Delete"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
