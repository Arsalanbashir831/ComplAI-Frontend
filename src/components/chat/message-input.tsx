'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useLoader } from '@/contexts/loader-context';
import { useIsMutating } from '@tanstack/react-query';
import { LoaderCircle, Plus, PlusCircle, Send } from 'lucide-react';

import { UploadedFile } from '@/types/upload';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { FileCard } from './file-card';
import { UploadModal } from './upload-modal';

export function MessageInput({
  chatId = undefined,
  isNewChat = false,
  onSendMessage,
  noStreamSendMessage,
}: {
  chatId?: string | undefined;
  isNewChat?: boolean;
  onSendMessage?: (content: string, document?: File) => Promise<void>;
  noStreamSendMessage?: (
    chatId: string,
    content: string,
    document?: File,
    return_type?: string
  ) => Promise<void>;
}) {
  const router = useRouter();
  const { createChat, sendMessage, addMessageNoStream } = useChat();
  const { isLoading } = useLoader();
  // Use global mutating state as our "isSending" indicator.
  const isSending = useIsMutating() > 0;

  // Main message text.
  const [message, setMessage] = useState('');
  // File upload modal state.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Track uploaded files.
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // Show/hide the mention menu.
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  // The currently selected mention type (if any).
  const [mentionType, setMentionType] = useState<'pdf' | 'docx' | null>(null);
  // For keyboard navigation within the menu.
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  const maxChars = 10000;

  // Define available mention options.
  const mentionOptions = [
    { value: 'pdf', label: 'PDF DOCUMENT', icon: '/icons/pdf-document.svg' },
    { value: 'docx', label: 'DOCX DOCUMENT', icon: '/icons/word-document.svg' },
  ];

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

    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      lastModified: file.lastModified,
      name: file.name,
      size: file.size,
      type: file.type,
      webkitRelativePath: file.webkitRelativePath,
      progress: 0,
      rawFile: file,
      arrayBuffer: file.arrayBuffer,
      bytes: async () => new Uint8Array(await file.arrayBuffer()),
      slice: file.slice,
      stream: file.stream,
      text: file.text,
    };

    setUploadedFiles([newFile]);
    await simulateUpload(newFile.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (isSending) return;
    if (!message.trim() && uploadedFiles.length === 0) return;

    try {
      let currentChatId = chatId;
      if (!currentChatId) {
        const response = await createChat(message.trim());
        currentChatId = response.id;
      }
      const documentToSend =
        uploadedFiles.length > 0 ? uploadedFiles[0].rawFile : undefined;

      if (onSendMessage) {
        if (!mentionType) {
          await onSendMessage(message.trim(), documentToSend);
        } else if (noStreamSendMessage) {
          await noStreamSendMessage(
            currentChatId,
            message.trim(),
            documentToSend,
            mentionType
          );
        }
        setMessage('');
        setUploadedFiles([]);
        setMentionType(null);
        return;
      } else if (isNewChat && currentChatId) {
        if (!mentionType) {
          await sendMessage({
            chatId: currentChatId,
            content: message.trim(),
            document: documentToSend,
            onChunkUpdate: (chunk) => {
              console.log(chunk);
            },
          });
        } else {
          await addMessageNoStream({
            chatId: currentChatId,
            content: message.trim(),
            document: documentToSend,
            return_type: mentionType,
          });
        }
        router.push(ROUTES.CHAT_ID(currentChatId));
      }

      setMessage('');
      setUploadedFiles([]);
      setMentionType(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // When the user types, check for a mention trigger.
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    const mentionMatch = input.match(/@(\w*)$/);
    if (mentionMatch) {
      // If there's text after @, show the menu.
      setShowMentionMenu(true);
      const query = mentionMatch[1].toLowerCase();
      // Auto-select if an option exactly matches or starts with the query.
      const foundIndex = mentionOptions.findIndex((option) =>
        option.value.startsWith(query)
      );
      setSelectedMentionIndex(foundIndex !== -1 ? foundIndex : 0);
    } else {
      setShowMentionMenu(false);
    }
    if (input.length <= maxChars) {
      setMessage(input);
    }
  };

  // Handle key events for both the textarea and mention menu.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Close mention menu on Esc.
    if (event.key === 'Escape' && showMentionMenu) {
      event.preventDefault();
      setShowMentionMenu(false);
      return;
    }
    // If the mention menu is open, handle navigation and selection.
    if (showMentionMenu) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedMentionIndex((prev) => (prev + 1) % mentionOptions.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedMentionIndex(
          (prev) => (prev - 1 + mentionOptions.length) % mentionOptions.length
        );
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        // Check if the user typed a complete mention (e.g. @docx or @pdf).
        const match = message.match(/@(\w+)$/);
        let selectedOption: string;
        if (match) {
          const query = match[1].toLowerCase();
          // If query exactly matches one of our options, use it.
          const found = mentionOptions.find((option) => option.value === query);
          selectedOption = found
            ? found.value
            : mentionOptions[selectedMentionIndex].value;
        } else {
          selectedOption = mentionOptions[selectedMentionIndex].value;
        }
        handleSelectMention(selectedOption as 'pdf' | 'docx');
        return;
      }
    }

    // Remove mention pill with backspace if textarea is empty.
    if (event.key === 'Backspace' && message.length === 0 && mentionType) {
      event.preventDefault();
      setMentionType(null);
    }

    // Allow Ctrl+Enter to send message.
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // When an option is selected, remove the mention trigger text and set the mention.
  const handleSelectMention = (type: 'pdf' | 'docx') => {
    setMentionType(type);
    setMessage((prev) => prev.replace(/@(\w+)$/i, '').trim());
    setShowMentionMenu(false);
  };

  return (
    <div>
      <div className="relative py-4">
        {(isSending || isLoading) && (
          <div className="absolute top-10 right-6">
            <LoaderCircle className="animate-spin h-5 w-5 text-gray-700" />
          </div>
        )}

        {showMentionMenu && (
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
        )}

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

            <Textarea
              placeholder="Message Compl-AI"
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="min-h-[40px] flex-1 resize-none border-none bg-transparent pr-20 shadow-none focus-visible:ring-0"
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
                onClick={() => setIsModalOpen(true)}
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
                {message.length} / {maxChars}
              </span>
              <Button
                size="icon"
                className="bg-gradient-to-r from-[#020F26] to-[#07378C] rounded-full"
                onClick={handleSendMessage}
                disabled={isSending}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-gray-500 italic">
          Compl-AI is intended for informational purposes only. It may contain
          errors and does not constitute legal advice
        </p>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        onClose={handleCloseModal}
        onUpload={handleUpload}
      />
    </div>
  );
}
