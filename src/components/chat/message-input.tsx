'use client';

import { ROUTES } from '@/constants/routes';
import { Plus, PlusCircle, Send } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/types/upload';

import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { FileCard } from './file-card';
import { UploadModal } from './upload-modal';

export function MessageInput({
  chatId = undefined,
  isNewChat = false,
  onSendMessage,
}: {
  chatId?: string | undefined;
  isNewChat?: boolean;
  onSendMessage: (content: string, document?: File) => void;
}) {
  const router = useRouter();
  const { createChat } = useChat();

  // State for the main message text
  const [message, setMessage] = useState('');
  // State for file upload modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Keep track of all uploaded files (though we'll only send the first one)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // State for showing the mention menu (the dropdown)
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  // State for which mention is selected: 'pdf', 'docx', or null
  const [mentionType, setMentionType] = useState<'pdf' | 'docx' | null>(null);

  const maxChars = 1000;

  // Temporary function to simulate file upload progress
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
        progress += 10; // Increment progress

        if (progress > 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  /**
   * Handle file uploads. We allow only one file in the UI.
   * We store the original File in the `rawFile` property.
   */
  const handleUpload = async (files: File[]) => {
    // Just take the first file
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
      rawFile: file, // <--- store the original File object here
      arrayBuffer: file.arrayBuffer,
      bytes: async () => new Uint8Array(await file.arrayBuffer()),
      slice: file.slice,
      stream: file.stream,
      text: file.text,
    };

    // Replace any previously uploaded file
    setUploadedFiles([newFile]);

    // Simulate file upload
    await simulateUpload(newFile.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  
  const handleSendMessage = async () => {
    // Do nothing if there's no message and no uploaded file
    if (!message.trim() && uploadedFiles.length === 0) return;

    // If no chat exists, create one
    let currentChatId = chatId;
    if (!currentChatId) {
      const response = await createChat(message.trim());
      currentChatId = response.id;
    }

    if (!message.trim() && uploadedFiles.length === 0) return;

    const documentToSend = uploadedFiles.length > 0 ? uploadedFiles[0].rawFile : undefined;
    
    onSendMessage(message.trim(), documentToSend);
    if (isNewChat && currentChatId) {
      router.push(ROUTES.CHAT_ID(currentChatId));
    
    }

    // Clear the input and any uploaded files
    setMessage('');
    setUploadedFiles([]);
    setMentionType(null);
  };

  // Whenever the user types in the textarea
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    // If the user just typed "@" at the end, show the mention menu
    if (input.endsWith('@')) {
      setShowMentionMenu(true);
    }
    // Enforce max length
    if (input.length <= maxChars) {
      setMessage(input);
    }
  };

  // If the user presses backspace, remove the mention pill if the textarea is empty
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Backspace') {
      // If there's no text and a mention is set, remove the mention pill
      if (message.length === 0 && mentionType) {
        event.preventDefault();
        setMentionType(null);
      }
    }

    // Allow Ctrl+Enter to send
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // When the user selects an option from the mention menu
  const handleSelectMention = (type: 'pdf' | 'docx') => {
    setMentionType(type);
    // Remove the trailing "@" from the text
    setMessage((prev) => prev.replace(/@$/, ''));
    // Hide the menu
    setShowMentionMenu(false);
  };

  return (
    <div>
      <div className="relative py-4">
        {/* MENTION MENU (positions above the input) */}
        {showMentionMenu && (
          <div className="absolute -top-20 left-0 z-10 w-[200px] rounded-md border border-gray-300 bg-white shadow-md">
            {/* PDF option */}
            <div
              className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-gray-100"
              onClick={() => handleSelectMention('pdf')}
            >
              <Image
                src="/icons/pdf-document.svg"
                width={20}
                height={20}
                alt="PDF icon"
              />
              <span className="text-sm text-gray-700">PDF DOCUMENT</span>
            </div>
            {/* DOCX option */}
            <div
              className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-gray-100"
              onClick={() => handleSelectMention('docx')}
            >
              <Image
                src="/icons/word-document.svg"
                width={20}
                height={20}
                alt="DOCX icon"
              />
              <span className="text-sm text-gray-700">DOCX DOCUMENT</span>
            </div>
          </div>
        )}

        <div className="bg-gray-light rounded-xl p-4">
          {/* If mentionType is set, show a pill on the left; otherwise, just the textarea */}
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
              className="min-h-[40px] flex-1 resize-none border-none bg-transparent pr-20 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            {/* File attachments */}
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

            {/* Character count & send button */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-dark">
                {message.length} / {maxChars}
              </span>
              <Button
                size="icon"
                className="bg-gradient-to-r from-[#020F26] to-[#07378C] rounded-full"
                onClick={handleSendMessage}
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
