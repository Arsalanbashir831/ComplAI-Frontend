'use client';

import Image from 'next/image';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatMessage } from '@/types/chat';
import { User } from '@/types/user';
import { cn, formatDate } from '@/lib/utils';

import DisplayUsername from '../common/display-username';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import CopyButton from './copy-button';
import { FileCard } from './file-card';

interface ChatBubbleProps {
  message: ChatMessage;
  user?: User | null;
}

export function ChatBubble({ message, user }: ChatBubbleProps) {
  const isBot = message.is_system_message;

  return (
    <div className={cn('flex mb-3', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          `flex flex-col gap-2 rounded-2xl py-4 items-center justify-center ${isBot ? 'px-0' : 'px-4 md:px-8'} md:max-w-[66.666667%]`,
          isBot
            ? 'bg-white'
            : 'bg-blue-light text-white border-gray-light border-2 shadow-md'
        )}
      >
        <div className="flex items-start gap-3">
          <Image
            src={
              isBot ? '/favicon.svg' : user?.profile_picture || '/avatar.png'
            }
            alt={isBot ? 'Compt-AI' : user?.username || 'User'}
            width={isBot ? 20 : 30}
            height={isBot ? 20 : 30}
            className="rounded-full w-8 h-8"
          />

          {/* Content Section */}
          <div className="flex flex-col gap-2">
            {/* User Message */}
            {!isBot && (
              <>
                {/* User Name and Timestamp */}
                <div className="flex flex-col md:flex-row md:gap-2 md:items-center">
                  <span className="text-sm text-black font-medium md:border-r border-gray md:pr-2">
                    <DisplayUsername />
                  </span>
                  <span className="text-black text-xs">
                    {formatDate(message.created_at)}
                  </span>
                </div>

                {/* Message Content */}
                <div className="text-sm break-words text-black whitespace-pre-line text-justify">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </Markdown>
                </div>

                {/* Attachments */}
                {message.file && (
                  <ScrollArea className="whitespace-nowrap flex w-full max-w-[600px]">
                    <div className="flex w-max h-14 gap-2">
                      <FileCard
                        file={message.file}
                        showExtraInfo={false}
                        titleColor="text-gray-dark"
                        className="bg-gray-light h-10"
                        hasShareButton={true}
                      />
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </>
            )}

            {/* Bot Message */}
            {isBot && (
              <>
                {/* Message Content */}
                <div className="text-sm text-black text-justify">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </Markdown>
                </div>

                {/* Attachments */}
                {message.file && (
                  <ScrollArea className="whitespace-nowrap flex w-full max-w-[600px]">
                    <div className="flex w-max h-14 gap-2">
                      <FileCard
                        file={message.file}
                        showExtraInfo={false}
                        titleColor="text-gray-dark"
                        className="bg-gray-light h-10"
                        hasShareButton={true}
                      />
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </>
            )}

            {/* Copy Button */}
            <CopyButton content={message.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
