import Image from 'next/image';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatMessage } from '@/types/chat';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

import { ScrollArea, ScrollBar } from '../ui/scroll-area';
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

  // Customized markdown components with proper types.
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
          {isBot ? (
            <Image
              src="/favicon.svg"
              alt="Compt-AI"
              width={40}
              height={40}
              className={cn(
                'rounded-full object-cover',
                message.content === 'loading' && 'animate-pulse'
              )}
            />
          ) : (
            // <div className="relative w-8 h-8">
            //   <Avatar>
            //     {/* Avatar Image: Only loads if user.profile_picture is a valid string */}
            //     <AvatarImage
            //       src={user?.profile_picture ?? undefined}
            //       alt={user?.username || 'User'}
            //     />

            //     {/* Fallback Avatar (Displays initials or default text) */}
            //     <AvatarFallback>
            //       {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            //     </AvatarFallback>
            //   </Avatar>
            // </div>
            <></>
          )}

          <div className="flex flex-col gap-2 w-full">
            {!isBot && (
              <>
                {/* <div className="flex flex-col md:flex-row md:gap-2 md:items-center">
                  <span className="text-lg text-black font-medium md:border-r border-gray md:pr-2">
                    <DisplayUsername />
                  </span>
                  <span className="text-black text-sm">
                    {formatDate(message.created_at)}
                  </span>
                </div> */}
                <div className="break-words text-black text-justify">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </Markdown>
                </div>
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
            {isBot && (
              <>
                <div className="text-black text-justify w-full">
                  {message.content !== 'loading' ? (
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.content}
                    </Markdown>
                  ) : (
                    <div className="w-full bg-gray-300 rounded animate-pulse flex items-center justify-center h-12 px-5">
                      <span className="text-gray-500 text-sm">
                        Generating Response
                      </span>
                    </div>
                  )}
                </div>
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
            {isBot && (
              <>
                {' '}
                <CopyButton content={message.content} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
