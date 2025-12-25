import React, { useCallback, useRef, useState } from 'react';

import { UploadedFilesProps } from '@/types/upload';
import { cn, validateFile } from '@/lib/utils';

import { ScrollArea } from '../ui/scroll-area';
import { FileCard } from './file-card';

export default function UploadedFiles({
  maxSize,
  allowedTypes,
  uploadedFiles,
  setUploadedFiles,
  onUpload,
  containerClassName,
  className,
  filesContainerClassName,
}: UploadedFilesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const processFiles = useCallback(
    (files: File[]) => {
      const errors = files
        .map((file) => validateFile(file, maxSize, allowedTypes))
        .filter((error): error is string => error !== null);

      if (errors.length > 0) {
        setTimeout(() => setError(errors[0]), 100);
        return;
      }

      setError(null);
      onUpload(files);
    },
    [maxSize, allowedTypes, onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  return (
    <div
      className={cn(
        'space-y-4 bg-blue-100 p-4 rounded-xl cursor-pointer',
        containerClassName
      )}
      onClick={handleClick}
    >
      {error && (
        <p className="mt-2 text-xs text-destructive text-center">{error}</p>
      )}
      <div className={cn('text-sm text-muted-foreground', className)}>
        Uploaded File(s)
        <input
          ref={inputRef}
          type="file"
          accept={allowedTypes?.join(',') || '*'}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <ScrollArea
        className={cn('w-full h-48', filesContainerClassName)}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex flex-col gap-2">
          {uploadedFiles.map((file) => (
            <FileCard key={file.id} file={file} onRemove={handleRemove} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
