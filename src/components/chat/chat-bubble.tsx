import Image from 'next/image';

import type { ChatMessage } from '@/types/chat';
import { cn, formatDate } from '@/lib/utils';

import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import CopyButton from './copy-button';
import { FileCard } from './file-card';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isBot = message.sender === 'bot';

  return (
    <div className={cn('flex mb-3', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          `flex flex-col gap-2 rounded-2xl py-4 items-center justify-center  ${isBot ? 'px-0' : 'px-4 md:px-8'} md:max-w-[66.666667%]`,
          isBot
            ? 'bg-[#ffff]'
            : 'bg-blue-light text-white border-gray-light border-2 shadow-md'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Image
            src={isBot ? '/favicon.svg' : message.avatarUrl || '/avatar.png'}
            alt={isBot ? 'Compt-AI' : message.userName || 'User'}
            width={isBot ? 20 : 30}
            height={isBot ? 20 : 30}
            className="rounded-full  w-8 h-8"
          />

          {/* Content Section */}
          <div className="flex flex-col gap-2 ">
            {/* User Message */}
            {!isBot && (
              <>
                {/* User Name */}
                <div className="flex flex-col md:flex-row md:gap-2 md:items-center">
                  <span className="text-sm text-black font-medium md:border-r border-gray md:pr-2">
                    {message.userName || 'John William'}
                  </span>
                  <span className="text-black text-xs">
                    {' '}
                    {formatDate(message.timestamp)}
                  </span>
                </div>

                {/* Message Content */}
                <p className="text-sm break-words text-black">
                  {message.content}
                </p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <ScrollArea className="whitespace-nowrap flex w-full max-w-[600px]">
                    <div className="flex w-max h-14 gap-2">
                      {message.attachments.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          showExtraInfo={false}
                          titleColor="text-gray-dark"
                          className="bg-gray-light h-10"
                          hasShareButton={true}
                        />
                      ))}
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
                <p className="text-sm text-gray-900">{message.content}</p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <ScrollArea className="whitespace-nowrap flex w-full max-w-[600px]">
                    <div className="flex w-max h-14 gap-2">
                      {message.attachments.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          showExtraInfo={false}
                          titleColor="text-gray-dark"
                          className="bg-gray-light h-10"
                          hasShareButton={true}
                        />
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}

                {/* Copy Button */}
                <CopyButton content={message.content} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
