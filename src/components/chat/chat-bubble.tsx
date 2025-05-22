import Image from 'next/image';
import chatLoading from '@/assets/lottie/chat_loading_anime.json';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatMessage } from '@/types/chat';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

import LottieAnimation from '../common/lottie-animation';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import CopyButton from './copy-button';
import { FileCard } from './file-card';

interface ChatBubbleProps {
  message: ChatMessage & { isError?: boolean };
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
  const isError = !!message.isError;
  const isLoading = message.content === 'loading';
  const showSkeleton = isLoading && !isError;
  const showAvatar = isBot && !showSkeleton;

  console.log('isLoading', isLoading);
  console.log('isError', isError);
  console.log('showSkeleton', showSkeleton);
  console.log('isBot', isBot);

  // Normalize files: allow string or array of file entries
  const files: Array<{ id?: number; file: string }> =
    Array.isArray(message.files) && message.files.length > 0
      ? (message.files as Array<{ id?: number; file: string }>)
      : typeof message.files === 'string'
        ? [{ file: message.files }]
        : [];

  console.log('message', message);

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
        className="mt-2 mb-2 ml-6 list-disc text-lg leading-relaxed tracking-normal"
        {...props}
      />
    ),
    ol: ({ ...props }) => (
      <ol
        className="mt-2 mb-2 ml-6 list-decimal text-lg leading-relaxed tracking-normal"
        {...props}
      />
    ),
    li: ({ ...props }) => (
      <li className="mb-1 text-lg leading-relaxed tracking-normal" {...props} />
    ),
    blockquote: ({ ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-4 text-lg leading-relaxed tracking-normal"
        {...props}
      />
    ),
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <pre
          className="bg-gray-100 p-4 my-4 overflow-auto rounded text-lg leading-relaxed"
          {...props}
        >
          <code className={match ? `language-${match[1]}` : ''}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-gray-100 p-1 rounded text-lg" {...props}>
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

  return (
    <div className={cn('flex mb-3', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          `flex flex-col gap-2 rounded-2xl py-2 items-center justify-center ${
            isBot ? 'px-0' : 'px-4 md:px-8 '
          } md:max-w-[66.666667%]`,
          isBot
            ? 'bg-white'
            : 'bg-blue-light text-white border-gray-light border-2 '
        )}
      >
        <div className="flex items-start gap-3">
          {isBot && showSkeleton && (
            <div className="flex items-center">
              <LottieAnimation
                animationData={chatLoading}
                style={{ width: '100px', height: '100px' }}
                className="w-6 h-6"
              />
              <div className="space-y-2 ">
                <Skeleton className="h-5 w-[350px]" />
                <Skeleton className="h-5 w-[350px]" />
              </div>
            </div>
          )}

          {showAvatar && (
            <Image
              src="/favicon.svg"
              alt="Compt-AI"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          )}

          <div className="flex flex-col gap-2 w-full">
            <div
              className={cn(
                'text-justify',
                isError ? 'text-red-500 italic' : 'text-black'
              )}
            >
              {message.content !== 'loading' ? (
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {message.content}
                </Markdown>
              ) : (
                <></>
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
                        file={new File([url], url?.split('/')?.pop() || 'file')}
                        showExtraInfo={false}
                        titleColor="text-gray-dark"
                        className="bg-gray-light h-10"
                        hasShareButton={true}
                      />
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}

            <div className="flex gap-2">
              {/* Copy button for bot messages */}
              {isBot && message.content !== 'loading' && (
                <CopyButton content={message.content} />
              )}

              {/* Refresh button for network errors */}
              {isError && (
                <Button
                  onClick={() => window.location.reload()}
                  className="text-xs px-3 h-fit py-1 rounded-full text-white"
                >
                  Refresh Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
