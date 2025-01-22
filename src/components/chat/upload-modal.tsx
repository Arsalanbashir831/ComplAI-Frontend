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

  const handleClose = () => {
    setUploadedFiles([]);
    onClose();
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

  const handleRemove = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = () => {
    onUpload(uploadedFiles);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg"
        closeButtonClass="bg-primary opacity-100 text-white p-1 rounded-full"
      >
        <DialogHeader className="flex-row items-center gap-4 mt-6">
          <div className="bg-primary rounded-2xl p-4">
            <Image
              src="/icons/plain-document.svg"
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
                <FileCard
                  key={file.id}
                  file={file}
                  onRemove={handleRemove}
                  type={file.type}
                />
              ))}
            </div>
          </div>
        ) : (
          <FileUpload
            onUpload={handleUpload}
            maxSize={5 * 1024 * 1024}
            allowedTypes={[
              'text/plain',
              'application/pdf',
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
