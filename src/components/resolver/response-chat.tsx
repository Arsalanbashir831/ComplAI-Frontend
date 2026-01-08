'use client';

import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ResolverMessage } from '@/hooks/useResolver';
import { ResolverChatBubble } from './resolver-chat-bubble';

interface ResponseChatProps {
  messages: ResolverMessage[];
  onRevert: (id: string | number) => void;
  onRefine: (prompt: string) => void;
  onRetry: () => void;
}

/**
 * Chat-like sidebar for viewing response history and refining responses.
 * Matches Figma design with rounded container, AI bubbles with logo, and user refinement bubbles.
 * Uses MarkdownRenderer for AI responses and CopyButton for copying.
 */
export function ResponseChat({
  messages,
  onRevert,
  onRefine,
  onRetry,
}: ResponseChatProps) {
  const [refineInput, setRefineInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refineInput.trim()) {
      onRefine(refineInput.trim());
      setRefineInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (refineInput.trim()) {
        onRefine(refineInput.trim());
        setRefineInput('');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable Message Area */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div>
          {messages.map((message, index) => (
            <ResolverChatBubble
              key={message.id}
              message={message}
              onRevert={onRevert}
              onRetry={index === messages.length - 1 ? onRetry : undefined}
            />
          ))}
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Refine Input - Fixed at bottom */}
      <div className="p-4 border-t border-[#DFEAFF]">
        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-[#EDEDED] rounded-[17px] px-5 py-4 pr-16 flex items-center">
            <TextareaAutosize
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Refine the Draft e.g., "Add apology", "Make it more formal"`}
              minRows={1}
              maxRows={4}
              className="min-h-[24px] max-h-[100px] w-full flex-1 resize-none bg-transparent text-sm text-[#39393A] placeholder:text-[#73726D]"
              style={{
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
            />
          </div>

          <Button
            type="submit"
            variant={refineInput.trim() === '' ? 'ghost' : 'default'}
            size="icon"
            className={`absolute right-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full transition-all duration-200 ${refineInput.trim() === ''
              ? 'bg-transparent border border-gray-300'
              : 'bg-gradient-to-r from-[#020F26] to-[#07378C]'
              }`}
          >
            <Send
              className="h-4 w-4"
              stroke={refineInput.trim() === '' ? 'gray' : 'white'}
            />
          </Button>
        </form>
      </div>
    </div>
  );
}
