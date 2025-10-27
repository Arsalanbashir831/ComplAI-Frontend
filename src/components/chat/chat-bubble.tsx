'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAbortController } from '@/contexts/abort-controller-context';
import { useAuthority } from '@/contexts/authority-context';
import { useChatContext } from '@/contexts/chat-context';
import { motion } from 'framer-motion';

import type { ChatMessage, Citation } from '@/types/chat';
import { User } from '@/types/user';
import { MarkdownRenderer } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';

import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
// import BounceDots from './BounceDotAnimation';
// import CircularLogoAnimation from './CircularLogoAnimation';
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
    citations?: string | Citation;
  };
  user?: User | null;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const params = useParams();
  const currentChatId = params.id as string; // Get chatId from route params

  const isBot = message.is_system_message;
  const isError = !!message.isError;
  const isLoading = message.content === 'loading';
  const hasReasoningStarted =
    message.reasoning && message.reasoning.trim().length > 0;
  const showSkeleton = isLoading && !isError && !hasReasoningStarted;
  const showAvatar = isBot && !showSkeleton;

  // Check if content has started streaming (not just 'loading')
  const hasReasoning = message.reasoning && message.reasoning.trim().length > 0;

  // Only show reasoning if we're still in reasoning phase (no content yet)
  const shouldShowReasoning = hasReasoning && message.content === 'loading';

  // State for tracking content chunks and animations
  const [contentChunks, setContentChunks] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const previousContentRef = useRef<string>('');
  const chunkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for tracking reasoning animations
  const [isReasoningStreaming, setIsReasoningStreaming] = useState(false);
  const previousReasoningRef = useRef<string>('');
  const reasoningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnimatedRef = useRef(false);
  // State for reasoning accordion
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const { setMessages } = useChatContext();
  const { selectedAuthority } = useAuthority();
  const { abortControllerRef } = useAbortController();
  const { sendMessage, addMessageNoStream } = useChat();

  // Function to extract heading from reasoning content
  const getReasoningHeading = (reasoning: string): string => {
    if (!reasoning) return 'AI Reasoning';

    // Look for markdown headers (##, ###, ####) - get the last one
    const headerMatches = reasoning.match(/^#{2,4}\s+(.+)$/gm);
    if (headerMatches && headerMatches.length > 0) {
      const lastHeader = headerMatches[headerMatches.length - 1];
      const headerText = lastHeader.match(/^#{2,4}\s+(.+)$/);
      if (headerText) {
        return headerText[1].trim();
      }
    }

    // Look for bold text - get the last one
    const boldMatches = reasoning.match(/\*\*(.+?)\*\*/g);
    if (boldMatches && boldMatches.length > 0) {
      const lastBold = boldMatches[boldMatches.length - 1];
      const boldText = lastBold.match(/\*\*(.+?)\*\*/);
      if (boldText) {
        return boldText[1].trim();
      }
    }

    // Look for the last sentence or phrase
    const sentences = reasoning.split('.');
    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 2].trim(); // -2 because last element is usually empty
      if (lastSentence.length > 0 && lastSentence.length < 50) {
        return lastSentence;
      }
    }

    return 'AI Reasoning';
  };

  // Effect to track content changes and create animated chunks
  useEffect(() => {
    if (!isBot || message.content === 'loading' || !message.content) {
      setContentChunks([]);
      setIsStreaming(false);
      return;
    }

    const currentContent = message.content;
    const previousContent = previousContentRef.current;

    // If content has grown, we're streaming
    if (currentContent.length > previousContent.length) {
      setIsStreaming(true);

      // Clear any existing timeout
      if (chunkTimeoutRef.current) {
        clearTimeout(chunkTimeoutRef.current);
      }

      // Extract the new chunk (the difference)
      const newChunk = currentContent.slice(previousContent.length);

      // Only add the new chunk, don't re-animate previous chunks
      setContentChunks(() => {
        // Keep only the latest chunk for animation
        return [newChunk];
      });

      // Set timeout to mark streaming as complete after a delay
      chunkTimeoutRef.current = setTimeout(() => {
        setIsStreaming(false);
        setContentChunks([]); // Clear chunks when streaming is done
      }, 1000); // Reduced timeout for faster transition
    } else if (currentContent !== previousContent) {
      // Content changed but not streaming (complete replacement)
      setIsStreaming(false);
      setContentChunks([]);
    }

    // Update the previous content reference
    previousContentRef.current = currentContent;

    // Cleanup timeout on unmount
    return () => {
      if (chunkTimeoutRef.current) {
        clearTimeout(chunkTimeoutRef.current);
      }
    };
  }, [message.content, isBot]);

  // Effect to track reasoning changes and create animated chunks
  useEffect(() => {
    if (!isBot || !message.reasoning || message.reasoning.trim() === '') {
      setIsReasoningStreaming(false);
      return;
    }

    const currentReasoning = message.reasoning;
    const previousReasoning = previousReasoningRef.current;

    // If reasoning has grown, we're streaming
    if (currentReasoning.length > previousReasoning.length) {
      setIsReasoningStreaming(true);

      // Clear any existing timeout
      if (reasoningTimeoutRef.current) {
        clearTimeout(reasoningTimeoutRef.current);
      }

      // Set timeout to mark reasoning streaming as complete after a delay
      reasoningTimeoutRef.current = setTimeout(() => {
        setIsReasoningStreaming(false);
      }, 2000); // 2 seconds of no new reasoning = streaming complete
    } else if (currentReasoning !== previousReasoning) {
      // Reasoning changed but not streaming (complete replacement)
      setIsReasoningStreaming(false);
    }

    // Update the previous reasoning reference
    previousReasoningRef.current = currentReasoning;

    // Cleanup timeout on unmount
    return () => {
      if (reasoningTimeoutRef.current) {
        clearTimeout(reasoningTimeoutRef.current);
      }
    };
  }, [message.reasoning, isBot]);

  // lock after first paint
  useEffect(() => {
    if (!hasAnimatedRef.current) hasAnimatedRef.current = true;
  }, []);

  const containerInitial = hasAnimatedRef.current
    ? false
    : { opacity: 0, y: 10 };
  const containerAnimate = { opacity: 1, y: 0 };

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
    const { promptText, uploadedFiles, mentionType } = message.retryData;

    // Use the current chatId from the URL instead of the retry data
    const chatId = currentChatId;

    if (!chatId) {
      console.error('No chatId available for retry');
      return;
    }

    // Get the correct authority from the authority context
    const chatCategory = selectedAuthority;

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
        content: 'loading',
        created_at: new Date().toISOString(),
        tokens_used: 0,
        is_system_message: true,
        files: null,
      },
    ]);
    // Use the global AbortController for this retry
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      if (!mentionType) {
        const completedResponse = await sendMessage({
          chatId,
          content: promptText,
          documents:
            uploadedFiles &&
            Array.isArray(uploadedFiles) &&
            uploadedFiles.length > 0
              ? (uploadedFiles as File[])
              : undefined,
          systemPromptCategory: chatCategory, // Use the correct chat category
          signal,
          onChunkUpdate: (chunk) => {
            setMessages((prev) => {
              const updatedMessages = prev.map((msg) => {
                if (msg.id === aiMessageId) {
                  const updatedMsg = { ...msg };

                  if (chunk.reasoning) {
                    updatedMsg.reasoning = chunk.reasoning;
                  }

                  if (chunk.content) {
                    updatedMsg.content = chunk.content;
                  }

                  return updatedMsg;
                }
                return msg;
              });

              return updatedMessages;
            });
          },
        });
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
          systemPromptCategory: chatCategory, // Use the correct chat category
          signal,
        });
        const rawContent = response.content;
        // let processedContent = rawContent.replace(/\\n/g, '\n');
        // processedContent = processedContent.replace(
        //   /\*\*([A-Z\s]+):\*\*([A-Z])/g,
        //   '**$1:**\n\n$2'
        // );
        //   processedContent = processedContent.replace(/-([a-zA-Z0-9])/g, '- $1');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...response,
                  content: rawContent,
                  id: aiMessageId,
                  citations: response.citations,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error during retry:', error);
      // Show error as AI response in chat
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Aborted by user (stop button)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: 'You have stopped the response. Want to try again?',
                  isError: true,
                  is_system_message: true,
                  retryData: {
                    chatId,
                    promptText,
                    uploadedFiles,
                    mentionType,
                  },
                }
              : msg
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content:
                    'Unable to generate response, please check your credit limit',
                  isError: true,
                  is_system_message: true,
                }
              : msg
          )
        );
      }
    }
  };

  return (
    <motion.div
      id={`message-${message.id}`}
      initial={containerInitial} // runs once
      animate={containerAnimate} // stable on updates
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
          {showSkeleton && (
            <div className="flex items-center">
              <Image
                unoptimized
                width={40}
                height={40}
                src="/loading-anime-circle.gif"
                alt="Loading..."
                className="w-10 h-10"
              />
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
            {/* Show reasoning accordion only during reasoning phase (before content starts) */}
            {isBot && shouldShowReasoning && (
              <motion.div
                className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
                key={`reasoning-accordion-${message.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Accordion Header with Shine Effect */}
                <button
                  onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 relative overflow-hidden"
                >
                  {/* Shine Effect Overlay */}
                  {isReasoningStreaming && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: 'easeInOut',
                      }}
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  <div className="flex items-center gap-2 relative z-10">
                    <motion.svg
                      className="h-4 w-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </motion.svg>
                    <motion.span
                      className="text-sm font-medium text-gray-700"
                      key={`reasoning-title-${message.reasoning?.length || 0}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getReasoningHeading(message.reasoning || '')}
                    </motion.span>
                    {isReasoningStreaming && (
                      <motion.span
                        className="text-xs text-blue-600"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        Thinking...
                      </motion.span>
                    )}
                  </div>

                  {/* <motion.svg
                    className="h-4 w-4 text-gray-500 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: isReasoningExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg> */}
                </button>

                {/* <AnimatePresence>
                  {isReasoningExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-white border-t border-gray-200">
                        <div className="relative">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`reasoning-content-${message.reasoning?.length || 0}`}
                              className="text-sm text-gray-700 relative"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{
                                duration: 0.3,
                                ease: 'easeInOut',
                              }}
                            >
                              <MarkdownRenderer
                                content={message.reasoning || ''}
                              />

                         
                              {isReasoningStreaming && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent"
                                  initial={{ x: '-100%' }}
                                  animate={{ x: '100%' }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    ease: 'easeInOut',
                                  }}
                                  style={{
                                    background:
                                      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                                    pointerEvents: 'none',
                                  }}
                                />
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence> */}
              </motion.div>
            )}

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
                  {message.content !== 'loading' && (
                    <div className="relative">
                      {/* Render complete content */}
                      <div className="relative">
                        {/* Show the complete content */}
                        <MarkdownRenderer content={message.content} />

                        {/* Overlay the latest chunk with animation during streaming */}
                        {isStreaming && contentChunks.length > 0 && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="bg-gradient-to-r from-transparent via-blue-50/30 to-transparent h-full" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* {isBot &&
                    /\n?\s*\|[^\n]*\|[^\n]*\|/m.test(message.content) &&
                    message.citations && (
                      <div className="mt-2">
                        <CitationBadges citations={message.citations} />
                      </div>
                    )} */}
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
            {/* {isBot &&
              message.citations &&
              message.content !== 'loading' &&
              !/\n?\s*\|[^\n]*\|[^\n]*\|/m.test(message.content) && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <CitationBadges citations={message.citations} />
                </div>
              )} */}

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
