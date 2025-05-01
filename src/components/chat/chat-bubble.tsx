import Image from 'next/image';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatMessage } from '@/types/chat';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import CopyButton from './copy-button';
import { FileCard } from './file-card';

interface ChatBubbleProps {
  message: ChatMessage;
  user?: User | null;
}

// Define a type for the props of our code component override
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isBot = message.is_system_message;

  // Normalize files: allow string or array of file entries
  const files: Array<{ id?: number; file: string }> =
    Array.isArray(message.files) && message.files.length > 0
      ? (message.files as Array<{ id?: number; file: string }>)
      : typeof message.files === 'string'
        ? [{ file: message.files }]
        : [];

  // Customized markdown components
  const markdownComponents: Components = {
    h1: ({ ...props }) => (
      <h1 className="mt-6 mb-4 text-3xl font-bold tracking-wide" {...props} />
    ),
    h2: ({ ...props }) => (
      <h2 className="mt-5 mb-3 text-2xl font-bold tracking-wide" {...props} />
    ),
    h3: ({ ...props }) => (
      <h3
        className="mt-4 mb-2 text-xl font-semibold tracking-wide"
        {...props}
      />
    ),
    hr: ({ ...props }) => (
      <hr className="my-4 border-t border-gray-300" {...props} />
    ),
    p: ({ ...props }) => (
      <p
        className="mt-2 mb-2 text-lg leading-relaxed tracking-normal"
        {...props}
      />
    ),
    ul: ({ ...props }) => (
      <ul
        className="mt-2 mb-2 ml-6 list-disc text-lg leading-relaxed"
        {...props}
      />
    ),
    ol: ({ ...props }) => (
      <ol
        className="mt-2 mb-2 ml-6 list-decimal text-lg leading-relaxed"
        {...props}
      />
    ),
    li: ({ ...props }) => (
      <li className="mb-1 text-lg leading-relaxed" {...props} />
    ),
    blockquote: ({ ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-4 text-lg"
        {...props}
      />
    ),
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <pre className="bg-gray-100 p-4 my-4 overflow-auto rounded" {...props}>
          <code className={match ? `language-${match[1]}` : ''}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-gray-100 p-1 rounded" {...props}>
          {children}
        </code>
      );
    },
    table: ({ ...props }) => (
      <table className="min-w-full border-collapse my-4 text-md" {...props} />
    ),
    thead: ({ ...props }) => <thead className="bg-blue-800" {...props} />,
    tbody: ({ ...props }) => <tbody className="bg-white" {...props} />,
    tr: ({ ...props }) => <tr className="border-b" {...props} />,
    th: ({ ...props }) => (
      <th className="px-4 py-2 text-left font-medium text-white" {...props} />
    ),
    td: ({ ...props }) => <td className="px-4 py-2 text-black" {...props} />,
  };

  // Determine if we should render loading skeleton
  const isLoading = isBot && (!message.content || message.content === '');

  return (
    <div className={cn('flex mb-3', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          `flex flex-col gap-2 rounded-2xl py-2 items-center justify-center ${
            isBot ? 'px-0' : 'px-4 md:px-8'
          } md:max-w-[66.666667%]`,
          isBot
            ? 'bg-white'
            : 'bg-blue-light text-white border-gray-light border-2'
        )}
      >
        <div className="flex items-start gap-3">
          {isBot && (
            <Image
              src="/favicon.svg"
              alt="Compt-AI"
              width={40}
              height={40}
              className={cn(
                'rounded-full object-cover',
                isLoading && 'animate-pulse'
              )}
            />
          )}

          <div className="flex flex-col gap-2 w-full">
            <div className={cn('text-justify text-black')}>
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  <Skeleton className="h-5 w-[350px]" />
                  <Skeleton className="h-5 w-[350px]" />
                </div>
              ) : (
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {message.content}
                </Markdown>
              )}
            </div>

            {/* File attachments */}
            {files.length > 0 && (
              <ScrollArea className="whitespace-nowrap flex w-full max-w-[600px]">
                <div className="flex w-max h-14 gap-2">
                  {files.map((entry, index) => {
                    const url = entry.file;
                    const key = entry.id ?? index;
                    return (
                      <FileCard
                        key={key}
                        file={new File([url], url.split('/').pop() || 'file')}
                        showExtraInfo={false}
                        titleColor="text-gray-dark"
                        className="bg-gray-light h-10"
                        hasShareButton
                      />
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}

            {/* Copy button for bot messages */}
            {isBot && !isLoading && <CopyButton content={message.content} />}
          </div>
        </div>
      </div>
    </div>
  );
}
