'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useChatContext } from '@/contexts/chat-context';
import { usePrompt } from '@/contexts/prompt-context';
import { useSendMessageTrigger } from '@/contexts/send-message-trigger-context';
import { useUserContext } from '@/contexts/user-context';
import { useIsMutating } from '@tanstack/react-query';
import { ArrowDown, Plus, PlusCircle, Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

import { UploadedFile } from '@/types/upload';
import { cn, isValidMarkdown, shortenText } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';

import { ConfirmationModal } from '../common/confirmation-modal';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { FileCard } from './file-card';
import { UploadModal } from './upload-modal';

// Add markdown validation helper at the top (after imports)

export function MessageInput({
  chatId: propChatId = undefined,
  isNewChat = false,
  showScrollButton,
  onScrollToBottom,
}: {
  chatId?: string;
  isNewChat?: boolean;
  showScrollButton: boolean;
  onScrollToBottom: () => void;
}) {
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    propChatId
  );
  const { createChat, sendMessage, addMessageNoStream } = useChat();
  const { promptText, setPromptText } = usePrompt();
  const { user } = useUserContext();
  //  const { refetch } = useChatMessages(currentChatId || '');
  const { setTrigger } = useSendMessageTrigger();
  // Import chat messages context.
  const { setMessages } = useChatContext();

  // Global mutating state as our "isSending" indicator.
  const isSending = useIsMutating() > 0;
  // AbortController ref to cancel the ongoing request.
  const abortControllerRef = useRef<AbortController | null>(null);
  // Remove local message state since we're using promptText from context.
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUplaodModalOpen, setIsUplaodModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionType, setMentionType] = useState<'pdf' | 'docx' | null>(null);
  // const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const maxChars = 10000;

  // Define available mention options.
  // const mentionOptions = [
  //   { value: 'pdf', label: 'PDF DOCUMENT', icon: '/icons/pdf-document.svg' },
  //   { value: 'docx', label: 'DOCX DOCUMENT', icon: '/icons/word-document.svg' },
  // ];

  // Ref for the mention menu container.
  const mentionMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mentionMenuRef.current &&
        !mentionMenuRef.current.contains(event.target as Node)
      ) {
        setShowMentionMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Temporary file upload simulation.
  const simulateUpload = (fileId: string) => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? { ...file, progress: Math.min(progress, 100) }
              : file
          )
        );
        progress += 10;
        if (progress > 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  /**
   * Handle file uploads. Only one file is stored.
   */
  const handleUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const newUploadedFiles: UploadedFile[] = files
      .map((file) => {
        if (!file) {
          console.warn('Skipping an invalid entry in the files array.');
          return null;
        }
        return {
          id: crypto.randomUUID(),
          lastModified: file.lastModified,
          name: file.name,
          size: file.size,
          type: file.type,
          webkitRelativePath: file.webkitRelativePath,
          progress: 0,
          rawFile: file,
          arrayBuffer: () => file.arrayBuffer(),
          bytes: async () => new Uint8Array(await file.arrayBuffer()),
          slice: (start?: number, end?: number, contentType?: string) =>
            file.slice(start, end, contentType),
          stream: () => file.stream(),
          text: () => file.text(),
        };
      })
      .filter((file) => file !== null) as UploadedFile[];

    if (newUploadedFiles.length === 0) {
      console.log('No valid files to upload.');
      return;
    }

    setUploadedFiles(newUploadedFiles);
    // Simulate upload progress for each file.
    await Promise.all(newUploadedFiles.map((file) => simulateUpload(file.id)));
  };

  const handleCloseModal = () => {
    setIsUplaodModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (isSending) return;
    if ((user?.tokens ?? 0) <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Ensure aiMessageId is always defined for error handling
    const aiMessageId: string = crypto.randomUUID();

    try {
      let localChatId = currentChatId;
      const documentsToSend: File[] = uploadedFiles.map(
        (upFile) => upFile.rawFile
      );

      if (!localChatId) {
        const response = await createChat(shortenText(promptText.trim(), 5));
        localChatId = response.id;
        setCurrentChatId(localChatId);
      }

      // If the user aborted during chat creation, do not proceed
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      if (isNewChat && localChatId) {
        setMessages([]);
        router.push(ROUTES.CHAT_ID(localChatId));
      }

      // Create a user message and add it to the context.
      const userMessage = {
        id: crypto.randomUUID(),
        chat: Number(localChatId),
        user: user?.username || 'You',
        content: promptText.trim(),
        created_at: new Date().toISOString(),
        tokens_used: 0,
        is_system_message: false,
        files: documentsToSend.length > 0 ? documentsToSend : null,
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: aiMessageId,
          chat: Number(localChatId),
          user: 'AI',
          content: 'loading',
          created_at: new Date().toISOString(),
          tokens_used: 0,
          is_system_message: true,
          files: null,
        },
      ]);

      // Trigger scroll to bottom after messages are added
      setTimeout(() => {
        setTrigger(true);
      }, 50);

      if (!mentionType) {
        // Streaming mode
        await sendMessage({
          chatId: localChatId,
          content: promptText.trim(),
          documents: documentsToSend,
          signal,
          onChunkUpdate: (chunk) => {
            // Only update if markdown is valid
            if (isValidMarkdown(chunk)) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId ? { ...msg, content: chunk } : msg
                )
              );
            }
          },
        }).then((completedResponse) => {
          // Final update with the completed content (guaranteed valid)
          // let processedContent = completedResponse.content.replace(/\\n/g, '\n');
          // processedContent = processedContent.replace(
          //   /\*\*([A-Z\s]+):\*\*([A-Z])/g,
          //   '**$1:**\n\n$2'
          // );
          // processedContent = processedContent.replace(/-([a-zA-Z0-9])/g, '- $1');

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
        // Non-streaming mode
        const response = await addMessageNoStream({
          chatId: localChatId,
          content: promptText.trim(),
          documents: documentsToSend,
          return_type: mentionType,
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

      setTrigger(false);
      setPromptText('');
      setUploadedFiles([]);
      setMentionType(null);
    } catch (error) {
      console.error('Error sending message:', error);
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
                    chatId: currentChatId,
                    promptText,
                    uploadedFiles,
                    mentionType,
                  },
                }
              : msg
          )
        );
      } else if (
        error &&
        typeof error === 'object' &&
        'isStreamError' in error &&
        (error as { isStreamError: boolean }).isStreamError &&
        'errorChunk' in error
      ) {
        // Error chunk received from stream
        const streamError = error as {
          isStreamError: boolean;
          errorChunk: string;
        };
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: streamError.errorChunk,
                  isError: true,
                  is_system_message: true,
                  errorChunk: streamError.errorChunk,
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
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If the user presses Escape and the mention menu is open, close it.
    if (event.key === 'Escape' && showMentionMenu) {
      event.preventDefault();
      // setShowMentionMenu(false);
      return;
    }

    // If the mention menu is open, handle up/down navigation.
    // if (showMentionMenu) {
    //   if (event.key === 'ArrowDown') {
    //     event.preventDefault();
    //     setSelectedMentionIndex((prev) => (prev + 1) % mentionOptions.length);
    //     return;
    //   }
    //   if (event.key === 'ArrowUp') {
    //     event.preventDefault();
    //     setSelectedMentionIndex(
    //       (prev) => (prev - 1 + mentionOptions.length) % mentionOptions.length
    //     );
    //     return;
    //   }
    //   // You can remove or disable any Ctrl+Enter logic here if you don't want it to conflict.
    // }

    // If Ctrl+Enter is pressed, insert a newline at the cursor position.
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      // Get the current cursor position.
      const { selectionStart, selectionEnd } = event.currentTarget;
      const newText =
        promptText.slice(0, selectionStart) +
        '\n' +
        promptText.slice(selectionEnd);
      setPromptText(newText);
      // Optionally, update the cursor position here if needed.
      return;
    }

    // If Backspace is pressed and there's no text, clear the mention type.
    if (event.key === 'Backspace' && promptText.length === 0 && mentionType) {
      event.preventDefault();
      setMentionType(null);
    }

    // If plain Enter is pressed, send the message.
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // // When the user types, check for a mention trigger.
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    // const mentionMatch = input.match(/@(\w*)$/);
    // if (mentionMatch) {
    //   setShowMentionMenu(true);
    //   const query = mentionMatch[1].toLowerCase();
    //   const foundIndex = mentionOptions.findIndex((option) =>
    //     option.value.startsWith(query)
    //   );
    //   setSelectedMentionIndex(foundIndex !== -1 ? foundIndex : 0);
    // } else {
    //   setShowMentionMenu(false);
    // }
    if (input.length <= maxChars) {
      setPromptText(input);
    }
  };

  // // Handle key events for the textarea and mention menu.
  // const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  //   if (event.key === 'Escape' && showMentionMenu) {
  //     event.preventDefault();
  //     setShowMentionMenu(false);
  //     return;
  //   }
  //   if (showMentionMenu) {
  //     if (event.key === 'ArrowDown') {
  //       event.preventDefault();
  //       setSelectedMentionIndex((prev) => (prev + 1) % mentionOptions.length);
  //       return;
  //     }
  //     if (event.key === 'ArrowUp') {
  //       event.preventDefault();
  //       setSelectedMentionIndex(
  //         (prev) => (prev - 1 + mentionOptions.length) % mentionOptions.length
  //       );
  //       return;
  //     }
  //     if (event.ctrlKey && event.key === 'Enter') {
  //       event.preventDefault();
  //       const match = promptText.match(/@(\w+)$/);
  //       let selectedOption: string;
  //       if (match) {
  //         const query = match[1].toLowerCase();
  //         const found = mentionOptions.find((option) => option.value === query);
  //         selectedOption = found
  //           ? found.value
  //           : mentionOptions[selectedMentionIndex].value;
  //       } else {
  //         selectedOption = mentionOptions[selectedMentionIndex].value;
  //       }
  //       handleSelectMention(selectedOption as 'pdf' | 'docx');
  //       return;
  //     }
  //   }
  //   if (event.key === 'Backspace' && promptText.length === 0 && mentionType) {
  //     event.preventDefault();
  //     setMentionType(null);
  //   }
  //   if (event.key === 'Enter') {
  //     event.preventDefault();
  //     handleSendMessage();
  //   }
  // };

  // const handleSelectMention = (type: 'pdf' | 'docx') => {
  //   setMentionType(type);
  //   setPromptText((prev) => prev.replace(/@(\w+)$/i, '').trim());
  //   setShowMentionMenu(false);
  // };

  return (
    <div className="relative">
      {showScrollButton && (
        <Button
          onClick={onScrollToBottom}
          className="absolute -top-5 left-1/2 transform -translate-x-1/2 
                     bg-primary text-white p-2 rounded-full shadow-lg z-10 animate-bounce ani"
          size="icon"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </Button>
      )}

      <div className="relative py-4">
        {/* {showMentionMenu && (
          <div
            ref={mentionMenuRef}
            className="absolute -top-20 left-0 z-10 w-[200px] rounded-md border border-gray-300 bg-white shadow-md"
          >
            {mentionOptions.map((option, index) => (
              <div
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-2 py-2',
                  index === selectedMentionIndex
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-100'
                )}
                onClick={() =>
                  handleSelectMention(option.value as 'pdf' | 'docx')
                }
              >
                <Image
                  src={option.icon}
                  width={20}
                  height={20}
                  alt={`${option.label} icon`}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </div>
            ))}
          </div>
        )} */}

        <div className="bg-gray-light rounded-xl p-4">
          <div className="flex items-start space-x-2">
            {mentionType && (
              <div
                className={cn(
                  'mt-1 rounded-full px-3 py-1 text-sm text-white',
                  mentionType === 'pdf' ? 'bg-[#B1362F]' : 'bg-[#07378C]'
                )}
              >
                {mentionType === 'pdf' ? '@PDF' : '@DOCX'}
              </div>
            )}

            <TextareaAutosize
              placeholder="Message Companion"
              value={promptText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="min-h-[40px] max-h-[100px] outline-none flex-1 resize-none border-none bg-transparent pr-20 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center">
              {uploadedFiles.length > 0 && (
                <ScrollArea className="whitespace-nowrap w-full max-w-[160px] min-[425px]:max-w-[250px] md:max-w-[600px]">
                  <div className="flex w-max space-x-2 p-2 h-14">
                    {uploadedFiles.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        showExtraInfo={false}
                        onRemove={(id) =>
                          setUploadedFiles((prev) =>
                            prev.filter((f) => f.id !== id)
                          )
                        }
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}

              <Button
                variant={uploadedFiles.length > 0 ? 'default' : 'ghost'}
                size={uploadedFiles.length > 0 ? 'icon' : 'default'}
                onClick={() => setIsUplaodModalOpen(true)}
                disabled={isSending}
                className={cn(
                  uploadedFiles.length > 0
                    ? 'text-white rounded-full p-1 w-fit h-fit'
                    : 'text-gray-dark hover:text-gray-600'
                )}
              >
                {uploadedFiles.length > 0 ? (
                  <Plus className="h-4 w-4" />
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Upload Files</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-dark">
                {promptText.length} / {maxChars}
              </span>
              <Button
                size="icon"
                className="bg-gradient-to-r from-[#020F26] to-[#07378C] rounded-full"
                onClick={isSending ? handleStop : handleSendMessage}
                disabled={!promptText.trim()}
                aria-label="Send message"
              >
                {isSending ? (
                  <Image
                    className="animate-pulse"
                    width={10}
                    height={10}
                    src={'/pause.svg'}
                    alt=""
                  />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-sm md:text-base text-center text-gray-500 italic">
          Companion is intended for informational purposes only. It may contain
          errors and does not constitute legal advice
        </p>
      </div>

      <UploadModal
        isOpen={isUplaodModalOpen}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        onClose={handleCloseModal}
        onUpload={handleUpload}
      />

      <ConfirmationModal
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        title="Out of Tokens"
        description="You are out of tokens. Would you like to upgrade your account?"
        confirmText="Upgrade"
        cancelText="Cancel"
        onConfirm={() => router.push(ROUTES.SUPSCRIPTION)}
      />
    </div>
  );
}
