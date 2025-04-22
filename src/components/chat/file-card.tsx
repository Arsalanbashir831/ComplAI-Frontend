import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DownloadIcon, X } from 'lucide-react';

import type { FileCardProps, UploadedFile } from '@/types/upload';
import { cn, convertSizeToReadable } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Helper to return an absolute URL using the backend URL if necessary
const getAbsoluteUrl = (url: string): string => {
  if (url.startsWith('http')) return url;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  return `${backendUrl}${url}`;
};

// Type guard for frontend-uploaded files.
const isUploadedFile = (
  file: UploadedFile | File | File[]
): file is UploadedFile => {
  return !Array.isArray(file) && (file as UploadedFile).progress !== undefined;
};

// Extract basic file details for backend files (passed as a URL).
const getFileDetails = (file: UploadedFile | File | string) => {
  if (typeof file === 'string') {
    const absoluteUrl = getAbsoluteUrl(file);
    // Extract filename without query/hash
    const rawName = absoluteUrl.split('/').pop() || 'Unknown file';
    const name = rawName.split('?')[0].split('#')[0];
    // Get extension from filename
    const extMatch = name.match(/\.([^.]+)$/);
    const extension = extMatch ? extMatch[1].toLowerCase() : '';
    // Determine MIME type based on extension
    let mimeType = 'text/plain';
    if (extension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (extension === 'doc' || extension === 'docx') {
      mimeType = 'application/docx';
    }
    console.log('abs', absoluteUrl);
    return { name, size: 0, type: mimeType, url: absoluteUrl };
  }
  return file as UploadedFile | File;
};

export function FileCard({
  file,
  showExtraInfo = true,
  onRemove,
  titleColor,
  hasShareButton,
  className,
}: FileCardProps) {
  const [backendFileSize, setBackendFileSize] = useState<number>(0);

  useEffect(() => {
    if (typeof file === 'string') {
      const absoluteUrl = getAbsoluteUrl(file);
      fetch(absoluteUrl, { method: 'HEAD' })
        .then((res) => {
          const cl = res.headers.get('content-length');
          if (cl) {
            setBackendFileSize(parseInt(cl, 10));
          }
        })
        .catch((err) => console.error('Failed to fetch file metadata:', err));
    }
  }, [file]);

  const fileData =
    typeof file === 'string'
      ? { ...getFileDetails(file), size: backendFileSize }
      : file;

  // Determine file name and extension
  const fileName = fileData.name;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  // Map extensions to icon names
  const fileTypeMap: Record<string, string> = {
    pdf: 'pdf-document',
    doc: 'word-document',
    docx: 'word-document',
  };

  console.log(fileTypeMap[extension]);
  const iconName = fileTypeMap[extension] || 'plain-document';
  const iconPath = `/icons/${iconName}.svg`;

  // Background based on extension
  console.log('ext', extension);
  const bgClass =
    extension === 'pdf'
      ? 'bg-[#B1362F]'
      : extension === 'doc' || extension === 'docx'
        ? 'bg-[#07378C]'
        : 'bg-transparent';

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg p-3',
        bgClass,
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* File Icon */}
        <Image src={iconPath} width={30} height={30} alt="Document" />

        <div className="flex flex-col">
          {/* File Name */}
          <span className={cn('font-normal text-sm text-white', titleColor)}>
            {fileName}
          </span>

          {/* File Size & Upload Status */}
          {showExtraInfo && (
            <span className="text-xs text-white">
              {convertSizeToReadable(fileData.size)}
              <span className="ml-2">
                {typeof file !== 'string' &&
                isUploadedFile(file) &&
                file.progress !== undefined &&
                file.progress < 100
                  ? ' Uploading...'
                  : ' Completed'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Download or Remove */}
      {hasShareButton ? (
        <Button
          onClick={() => {
            // const url = 'url' in fileData ? fileData.url : (file as UploadedFile).id;
            // console.log(fileData.name)
            const a = document.createElement('a');
            a.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/chat_files/${fileData.name}`;
            a.download = fileData.name;
            a.click();
          }}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/20 text-gray-dark"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="sr-only">Download file</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/20 hover:text-white text-white"
          onClick={() =>
            onRemove &&
            onRemove(
              'url' in fileData && fileData.url
                ? fileData.url
                : (file as UploadedFile).id
            )
          }
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove file</span>
        </Button>
      )}
    </div>
  );
}
