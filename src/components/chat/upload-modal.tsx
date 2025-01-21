'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CloudUpload } from 'lucide-react';

import type { UploadedFile, UploadModalProps } from '@/types/upload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { FileCard } from './file-card';
import { FileUpload } from './file-upload';

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUpload = (files: File[]) => {
    const newFiles = files.map((file) => ({
      ...file,
      id: crypto.randomUUID(),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemove = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = () => {
    onUpload(uploadedFiles);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg"
        closeButtonClass="bg-primary opacity-100 text-white p-1 rounded-full"
      >
        <DialogHeader className="flex-row items-center gap-4 mt-6">
          <div className="bg-primary rounded-2xl p-4">
            <Image
              src="/icons/text-document.svg"
              width={32}
              height={32}
              alt="Upload"
            />
          </div>
          <div className="space-y-2">
            <DialogTitle>Upload Your Necessary Documents</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Start create and manage your property by few clicks!
            </p>
          </div>
        </DialogHeader>

        {uploadedFiles.length > 0 ? (
          <div className="space-y-4 bg-blue-100 p-4 rounded-xl">
            <div className="text-sm text-muted-foreground">
              Uploaded File(s)
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <FileCard key={file.id} file={file} onRemove={handleRemove} />
              ))}
            </div>
          </div>
        ) : (
          <FileUpload
            onUpload={handleUpload}
            maxSize={5 * 1024 * 1024}
            allowedTypes={[
              '.txt',
              '.pdf',
              '.doc',
              '.docx',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]}
          />
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button onClick={handleSubmit} className="px-8">
              <span className="font-normal">Submit</span>
              <CloudUpload className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
