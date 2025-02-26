'use client';

import { useRouter } from 'next/navigation'; // Import useRouter
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { Plus, PlusCircle, Send } from 'lucide-react';

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
}: {
  chatId?: string | undefined;
  isNewChat?: boolean;
}) {
  const router = useRouter();
  const { createChat, sendMessage } = useChat();

  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const maxChars = 1000;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    if (input.length <= maxChars) {
      setMessage(input);
    }
  };

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
      }, 200); // Simulate progress every 200ms
    });
  };

  const handleUpload = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: crypto.randomUUID(), // Unique identifier
      lastModified: file.lastModified,
      name: file.name,
      size: file.size,
      type: file.type,
      webkitRelativePath: file.webkitRelativePath,
      progress: 0, // Optional property for tracking upload progress
      arrayBuffer: file.arrayBuffer,
      bytes: async () => new Uint8Array(await file.arrayBuffer()),
      slice: file.slice,
      stream: file.stream,
      text: file.text,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Simulate file upload and update progress
    await Promise.all(newFiles.map((file) => simulateUpload(file.id)));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendMessage = async () => {
    // Do nothing if there's no message and no uploaded file.
    if (!message.trim() && uploadedFiles.length === 0) return;

    // If no chat exists, create one and update chatId.
    if (!chatId) {
      const response = await createChat(message.trim()); // response is Chat
      chatId = response.id;
    }

    await sendMessage({
      chatId,
      content: message.trim(),
    });

    // If this is a new chat, navigate to the chat route.
    if (isNewChat) {
      router.push(ROUTES.CHAT_ID(chatId));
    }

    // Clear the input and any uploaded files.
    setMessage('');
    setUploadedFiles([]);
  };

  return (
    <div>
      <div className="py-4  ">
        <div className="relative bg-gray-light rounded-xl p-4">
          <div></div>
          <Textarea
            placeholder="Message Compl-AI"
            value={message}
            onChange={handleChange}
            onKeyDown={(event) => {
              if (event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                handleSendMessage();
              }
            }}
            className="resize-none pr-20 border-none bg-transparent shadow-none focus-visible:ring-0"
          />
          <div className="flex justify-between items-center gap-2 mt-2">
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
                            prev.filter((file) => file.id !== id)
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

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-dark">
                {message.length} / {maxChars}
              </span>
              <Button
                size="icon"
                className="bg-gradient-to-r from-[#020F26] to-[#07378C] rounded-full"
                onClick={handleSendMessage} // Handle message send
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>
        <p className="text-center mt-2 text-gray-500 italic">
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
