import Image from 'next/image';
import { useChatContext } from '@/contexts/chat-context';
import { motion } from 'framer-motion';

import type { ChatMessage } from '@/types/chat';
import { User } from '@/types/user';
import { MarkdownRenderer } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';

import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import BounceDots from './BounceDotAnimation';
import { CitationBadges } from './CitationBadges';
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
          'flex flex-col gap-2 rounded-2xl py-4 px-5 md:px-8',
          isBot
            ? 'bg-white'
            : 'bg-blue-light text-white border-gray-light border-2',
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
                    <MarkdownRenderer
                      content={
                        message.errorChunk
                          ? message.errorChunk
                          : message.content
                      }
                    />
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
                  <MarkdownRenderer content={message.content} />
                  {isBot &&
                    /\n?\s*\|[^\n]*\|[^\n]*\|/m.test(message.content) &&
                    message.citations && (
                      <div className="mt-2">
                        <CitationBadges citations={message.citations} />
                      </div>
                    )}
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

            {/* Citations section (for non-table content) */}
            {isBot &&
              message.citations &&
              message.content !== 'loading' &&
              !/\n?\s*\|[^\n]*\|[^\n]*\|/m.test(message.content) && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <CitationBadges citations={message.citations} />
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
