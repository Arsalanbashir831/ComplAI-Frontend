'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';

import type { FileUploadProps } from '@/types/upload';
import { cn, validateFile } from '@/lib/utils';

export function FileUpload({
  onUpload,
  maxSize,
  allowedTypes,
  title = 'Drag and drop here or click to upload',
  subtitle = 'File types allowed: TXT, PDF, DOC',
  className,
  titleClassName,
  subtitleClassName,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFiles = useCallback(
    (files: File[]) => {
      const errors = files
        .map((file) => validateFile(file, maxSize, allowedTypes))
        .filter((error): error is string => error !== null);

      if (errors.length > 0) {
        setError(errors[0]);
        return;
      }

      setError(null);
      onUpload(files);
    },
    [maxSize, allowedTypes, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg p-12 text-center cursor-pointer border-2 border-dashed',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25',
          error && 'border-destructive',
          className
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={allowedTypes?.join(',') || '*'}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Image
          src="/icons/file-upload.svg"
          alt="file-upload"
          width={50}
          height={50}
        />
        <div className={cn('mb-2 font-medium text-primary', titleClassName)}>
          {title}
        </div>
        <p className={cn('text-sm text-gray-dark', subtitleClassName)}>
          {subtitle}
        </p>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
