'use client';

import { useState } from 'react';
import { PlusCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { UploadModal } from './upload-modal';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const maxChars = 1000;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    if (input.length <= maxChars) {
      setMessage(input);
    }
  };

  const handleUpload = (files: File[]) => {
    console.log('Uploaded files:', files);
    setIsModalOpen(false);
    // Handle the upload logic here
  };

  return (
    <div className="relative">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="relative bg-gray-light rounded-xl p-4">
          <Textarea
            placeholder="Message Compl-AI"
            value={message}
            onChange={handleChange}
            className="resize-none pr-20 border-none bg-transparent shadow-none focus-visible:ring-0"
          />
          <div className="flex justify-between items-center gap-2 mt-2">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(true)}
              className="text-gray-dark hover:text-gray-600"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Upload Files</span>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-dark">
                {message.length} / {maxChars}
              </span>
              <Button
                size="icon"
                className="bg-gradient-to-r from-[#020F26] to-[#07378C] rounded-full"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
