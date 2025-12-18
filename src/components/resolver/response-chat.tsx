'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

import { MarkdownRenderer } from '@/lib/markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import CopyButton from '@/components/common/copy-button';

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  /** For AI messages: the full markdown content. For user messages: the text. */
  content: string;
}

interface ResponseChatProps {
  messages: ChatMessage[];
  onRevert: (id: string) => void;
  onRefine: (prompt: string) => void;
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
    <div className="w-[40svw] shrink-0 bg-white rounded-[10px] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.02)] flex flex-col h-[calc(100vh-110px)] mx-4">
      {/* Scrollable Message Area */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'ai' ? (
                /* AI Message Bubble */
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* AI Logo */}
                    <div className="shrink-0">
                      <Image
                        src="/favicon.svg"
                        alt="Compl-AI"
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      {/* Markdown Rendered Content */}
                      <div className="text-sm text-[#39393A]">
                        <MarkdownRenderer content={message.content} />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <CopyButton content={message.content} />
                        <Button
                          onClick={() => onRevert(message.id)}
                          className="h-9 px-5 text-sm font-medium rounded-lg"
                        >
                          Revert to History
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* User Refinement Message */
                <div className="flex justify-end">
                  <div className="bg-[#F5F8FF] rounded-xl px-6 py-4 max-w-[90%]">
                    <p className="text-sm text-[#39393A] text-center">
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Refine Input - Fixed at bottom */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-[#EDEDED] rounded-[17px] px-5 py-4 pr-16 flex items-center">
            <TextareaAutosize
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Refine the Draft e.g., "Add apology", "Make it more formal"`}
              minRows={1}
              maxRows={4}
              className="min-h-[24px] max-h-[100px] w-full flex-1 resize-none bg-transparent text-sm text-[#73726D] placeholder:text-[#73726D]"
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
            className={`absolute right-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full transition-all duration-200 ${
              refineInput.trim() === ''
                ? 'bg-transparent border border-gray-300'
                : 'bg-gradient-to-r from-[#020F26] to-[#07378C]'
            }`}
          >
            <Send
              className="h-4 w-4"
              color={refineInput.trim() === '' ? 'gray' : 'white'}
            />
          </Button>
        </form>
      </div>
    </div>
  );
}
