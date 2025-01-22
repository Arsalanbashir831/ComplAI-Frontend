import type { ChatMessage } from '@/types/chat';
import { cn, formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import CopyButton from './copy-button';
import { FileCard } from './file-card';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isBot = message.sender === 'bot';

  return (
    <div className={cn('flex mb-5', isBot ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex flex-col gap-2 bg-blue-light border-gray-light border-2 shadow-md rounded-2xl py-6 px-8 max-w-[66.666667%]',
          isBot && 'items-start'
        )}
      >
        <div className="flex items-center gap-2 ">
          {!isBot ? (
            <Avatar className="h-6 w-6">
              {message.avatarUrl || '/avatar.png' ? (
                <AvatarImage
                  src={message.avatarUrl || '/avatar.png'}
                  alt={message.userName || 'John William'}
                />
              ) : (
                <AvatarFallback>
                  {message.userName?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
          ) : (
            <Avatar className="h-6 w-7">
              <AvatarImage src="/favicon.svg" alt="Compt-AI" />
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium border-r border-gray-light pr-2">
              {isBot ? 'Compt-AI' : message.userName || 'John William'}
            </span>
            <span className="text-xs text-gray-dark">
              {formatDate(message.timestamp)}
            </span>
          </div>
        </div>

        <div className={cn('rounded-lg text-sm text-justify')}>
          {message.content}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <ScrollArea className="whitespace-nowrap w-full max-w-[600px]">
            <div className="flex w-max space-x-2 p-2 h-14">
              {message.attachments.map((file) => (
                // <FileCard key={file.id} file={file} showExtraInfo={false} />
                <div key={file.id} className="flex items-center gap-2">
                  <FileCard
                    file={file}
                    showExtraInfo={false}
                    titleColor="text-gray-dark"
                    className="bg-gray-light h-10"
                    hasShareButton={true}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Copy icon to copy the content of the bot */}
        {isBot && <CopyButton content={message.content} />}
      </div>
    </div>
  );
}
