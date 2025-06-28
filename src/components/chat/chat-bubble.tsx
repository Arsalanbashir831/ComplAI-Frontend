import Image from 'next/image';
import { useChatContext } from '@/contexts/chat-context';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatMessage } from '@/types/chat';
import { User } from '@/types/user';
import { cn, preprocessMarkdown } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';

import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import BounceDots from './BounceDotAnimation';
import CopyButton from './copy-button';
import { FileCard } from './file-card';

interface ChatBubbleProps {
  message: ChatMessage & {
    isError?: boolean;
    retryData?: {
      chatId: string;
      promptText: string;
      uploadedFiles?: File[];
      mentionType?: string;
    };
    errorChunk?: string;
    citations?: string;
  };
  user?: User | null;
}

function normalizeTables(md: string): string {
  const lines = md.split('\n');
  let inTable = false;
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 2) {
      // Start of a table block
      if (!inTable) {
        if (result.length && result[result.length - 1].trim() !== '')
          result.push('');
        inTable = true;
      }
      // Ensure line starts and ends with a single pipe
      let normalized = line.trim();
      if (!normalized.startsWith('|')) normalized = '| ' + normalized;
      if (!normalized.endsWith('|')) normalized = normalized + ' |';
      // Remove extra spaces before/after pipes
      normalized = normalized.replace(/\s*\|\s*/g, ' | ');
      result.push(normalized);
    } else {
      if (inTable) {
        // End of table block
        if (result.length && result[result.length - 1].trim() !== '')
          result.push('');
        inTable = false;
      }
      result.push(line);
    }
  }
  return result.join('\n');
}

const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mt-8 mb-4 text-2xl font-extrabold text-gray-900 border-b border-gray-200 pb-2"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-6 mb-3 text-xl font-bold text-gray-800 border-b border-gray-100 pb-1"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-5 mb-2 text-lg font-semibold text-gray-700" {...props} />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className="my-6 border-t-2 border-gray-200 rounded-full w-1/2 mx-auto"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="mt-2 mb-2 text-base leading-relaxed text-gray-900"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="mt-2 mb-2 ml-6 list-disc text-base leading-relaxed text-gray-900"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="mt-2 mb-2 ml-6 list-decimal text-base leading-relaxed text-gray-900"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="mb-1 text-base leading-relaxed" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-blue-400 bg-blue-50 pl-4 italic my-4 text-base text-gray-700 rounded"
      {...props}
    />
  ),
  code: ({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline ? (
      <pre
        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner my-4"
        {...props}
      >
        <code className={match ? `language-${match[1]}` : ''}>{children}</code>
      </pre>
    ) : (
      <code
        className="bg-gray-200 text-gray-900 px-1 py-0.5 rounded font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-2">
      <table
        className="min-w-full border border-blue-300 rounded-xl shadow-lg bg-white text-sm"
        {...props}
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-blue-100 sticky top-0 z-10" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="bg-white" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="border-b last:border-b-0 even:bg-blue-50 hover:bg-blue-100 transition-colors duration-100"
      {...props}
    />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-5 py-3 text-left font-bold text-blue-900 border-b border-blue-200 whitespace-nowrap text-base"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-5 py-3 text-blue-900 border-b border-blue-100 whitespace-nowrap align-top"
      {...props}
    />
  ),
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isBot = message.is_system_message;
  const isError = !!message.isError;
  const isLoading = message.content === 'loading';
  const showSkeleton = isLoading && !isError;
  const showAvatar = isBot && !showSkeleton;

  const { setMessages } = useChatContext();
  const { sendMessage, addMessageNoStream } = useChat();

  // Normalize files: allow string or array of file entries
  const files: Array<{ id?: number; file: string }> =
    Array.isArray(message.files) && message.files.length > 0
      ? (message.files as Array<{ id?: number; file: string }>)
      : typeof message.files === 'string'
        ? [{ file: message.files }]
        : [];

  // Preprocess and normalize markdown content
  const preprocessedContent = preprocessMarkdown(message.content);
  const containsTable =
    isBot && /\n?\s*\|[^\n]*\|[^\n]*\|/m.test(preprocessedContent);
  const normalizedContent = containsTable
    ? normalizeTables(preprocessedContent)
    : preprocessedContent;

  // Preserve double (or more) spaces as &nbsp;
  function preserveSpaces(md: string): string {
    // Replace 2 or more spaces with equivalent &nbsp;
    return md.replace(/ {2,}/g, (match) => '&nbsp;'.repeat(match.length));
  }

  const finalContent = preserveSpaces(normalizedContent);

  // Retry handler for stopped responses
  const handleRetry = async () => {
    if (!message.retryData) return;
    const { chatId, promptText, uploadedFiles, mentionType } =
      message.retryData;
    // Remove the error message
    setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
    // Re-send the message
    // This logic mimics handleSendMessage in message-input
    const aiMessageId = crypto.randomUUID();
    const userMessage = {
      id: crypto.randomUUID(),
      chat: Number(chatId),
      user: 'You',
      content: promptText,
      created_at: new Date().toISOString(),
      tokens_used: 0,
      is_system_message: false,
      files:
        uploadedFiles &&
        Array.isArray(uploadedFiles) &&
        uploadedFiles.length > 0
          ? (uploadedFiles as File[])
          : null,
    };
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: aiMessageId,
        chat: Number(chatId),
        user: 'AI',
        content: '',
        created_at: new Date().toISOString(),
        tokens_used: 0,
        is_system_message: true,
        files: null,
      },
    ]);
    // Create a new AbortController for this retry
    const abortController = new AbortController();
    const signal = abortController.signal;
    if (!mentionType) {
      await sendMessage({
        chatId,
        content: promptText,
        documents:
          uploadedFiles &&
          Array.isArray(uploadedFiles) &&
          uploadedFiles.length > 0
            ? (uploadedFiles as File[])
            : undefined,
        onChunkUpdate: (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: chunk } : msg
            )
          );
        },
        signal,
      }).then((completedResponse: import('@/types/chat').ChatMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...completedResponse,
                  content: completedResponse.content,
                  id: aiMessageId,
                  citations: completedResponse.citations,
                }
              : msg
          )
        );
      });
    } else {
      const response = await addMessageNoStream({
        chatId,
        content: promptText,
        documents:
          uploadedFiles &&
          Array.isArray(uploadedFiles) &&
          uploadedFiles.length > 0
            ? (uploadedFiles as File[])
            : undefined,
        return_type: mentionType as 'docx' | 'pdf' | null | undefined,
        signal,
      });
      const rawContent = response.content;
      let processedContent = rawContent.replace(/\\n/g, '\n');
      processedContent = processedContent.replace(
        /\*\*([A-Z\s]+):\*\*([A-Z])/g,
        '**$1:**\n\n$2'
      );
      processedContent = processedContent.replace(/-([a-zA-Z0-9])/g, '- $1');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...response,
                content: processedContent,
                id: aiMessageId,
                citations: response.citations,
              }
            : msg
        )
      );
    }
  };

  return (
    <motion.div
      id={`message-${message.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex mb-3', isBot ? 'justify-start' : 'justify-end')}
    >
      <div
        className={cn(
          `flex flex-col gap-2 rounded-2xl py-2 items-center justify-center ${
            isBot ? 'px-0' : 'px-4 md:px-8 '
          } md:max-w-[100%]`,
          isBot
            ? 'bg-white'
            : 'bg-blue-light text-white border-gray-light border-2 ',
          isLoading && 'min-h-[50vh] justify-start'
        )}
      >
        <div className="flex items-start gap-3">
          {isLoading && (
            <div className="flex items-center">
              <BounceDots dotColor="#0a59ec" size={6} duration={1} />
              <span className="text-gray-600 ml-2 text-lg">Thinking...</span>
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
            {!isLoading &&
              (isBot && isError ? (
                <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                      />
                    </svg>
                    <span className="font-semibold">AI Error</span>
                  </div>
                  <div className="text-sm italic">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.errorChunk ? message.errorChunk : finalContent}
                    </Markdown>
                  </div>
                  {message.retryData && (
                    <Button
                      onClick={handleRetry}
                      className="mt-2 text-xs px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Retry Response
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    'text-justify',
                    isError ? 'text-red-500 italic' : 'text-black'
                  )}
                >
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {finalContent}
                  </Markdown>
                </div>
              ))}

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

            {/* Citations section */}
            {isBot && message.citations && message.content !== 'loading' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-blue-800">
                    Sources & Citations
                  </span>
                </div>
                <div className="text-sm text-blue-700 leading-relaxed">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ...markdownComponents,
                      p: (
                        props: React.HTMLAttributes<HTMLParagraphElement>
                      ) => (
                        <p
                          className="mb-2 text-sm leading-relaxed"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {message.citations}
                  </Markdown>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {/* Copy button for bot messages */}
              {isBot && message.content !== 'loading' && (
                <CopyButton content={message.content} />
              )}

              {/* Refresh button for network errors */}
              {/* {isError && (
                <Button
                  onClick={() => window.location.reload()}
                  className="text-xs px-3 h-fit py-1 rounded-full text-white"
                >
                  Refresh Page
                </Button>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
