import Image from 'next/image';
import { CloudUpload } from 'lucide-react';

import type { UploadModalProps } from '@/types/upload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/common/file-upload';
import UploadedFiles from '@/components/common/uploaded-files';

export function UploadModal({
  isOpen,
  uploadedFiles,
  setUploadedFiles,
  onClose,
  onUpload,
}: UploadModalProps) {
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleSubmit = () => {
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
              src="/icons/plain-document.svg"
              width={32}
              height={32}
              alt="Upload"
            />
          </div>
          <div className="space-y-2">
            <DialogTitle>Upload Your Documents</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Start create and manage your property by few clicks!
            </p>
          </div>
        </DialogHeader>

        {uploadedFiles.length > 0 ? (
          <UploadedFiles
            {...{
              uploadedFiles,
              setUploadedFiles,
              onUpload,
              maxSize,
              allowedTypes,
            }}
          />
        ) : (
          <FileUpload
            onUpload={onUpload}
            maxSize={maxSize}
            allowedTypes={allowedTypes}
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
