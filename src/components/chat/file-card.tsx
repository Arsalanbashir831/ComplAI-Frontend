import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DownloadIcon, X } from 'lucide-react';

import type { FileCardProps, UploadedFile } from '@/types/upload';
import { cn, convertSizeToReadable } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Helper to return an absolute URL using the backend URL if necessary
const getAbsoluteUrl = (url: string): string => {
  // If the URL is already absolute, return as is.
  if (url.startsWith('http')) return url;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  return `${backendUrl}${url}`;
};

// Type guard for frontend-uploaded files.
const isUploadedFile = (file: UploadedFile | File): file is UploadedFile => {
  return (file as UploadedFile).progress !== undefined;
};

// Extract basic file details for backend files (passed as a URL).
const getFileDetails = (file: UploadedFile | File | string) => {
  if (typeof file === 'string') {
    // Convert relative URL to an absolute one.
    const absoluteUrl = getAbsoluteUrl(file);
    const name = absoluteUrl.split('/').pop() || 'Unknown file';
    const extension = name.split('.').pop()?.toLowerCase();
    // Set a basic MIME type based on extension.
    let mimeType = 'text/plain';
    if (extension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (extension === 'doc' || extension === 'docx') {
      mimeType = 'application/docx';
    }
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
  // For backend files (passed as a URL), fetch file size from metadata.
  const [backendFileSize, setBackendFileSize] = useState<number>(0);

  useEffect(() => {
    if (typeof file === 'string') {
      const absoluteUrl = getAbsoluteUrl(file);
      fetch(absoluteUrl, { method: 'HEAD' })
        .then((res) => {
          const cl = res.headers.get('content-length');
          if (cl) {
            setBackendFileSize(parseInt(cl));
          }
        })
        .catch((err) => console.error('Failed to fetch file metadata:', err));
    }
  }, [file]);

  // Create a unified file data object.
  const fileData =
    typeof file === 'string'
      ? { ...getFileDetails(file), size: backendFileSize }
      : file;

  // Determine the icon path based on the file type.
  const getIconPath = (details: { name: string; type: string }) => {
    console.log('details', details);
    const fileTypeMap: Record<string, string> = {
      pdf: 'pdf-document',
      plain: 'plain-document',
      docx: 'word-document',
      'vnd.openxmlformats-officedocument.wordprocessingml.document':
        'word-document',
    };

    let key = '';
    if (details.type) {
      const parts = details.type.split('/');
      key = parts[1] || '';
    } else {
      const extension = details.name.split('.').pop()?.toLowerCase();
      key = extension || 'plain';
    }

    return `/icons/${fileTypeMap[key] || 'plain-document'}.svg`;
  };

  console.log('fileData', fileData);

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg p-3',
        // Use file type to decide on a background color.
        typeof fileData === 'object' && 'url' in fileData && fileData.url
          ? fileData.type === 'application/pdf'
            ? 'bg-[#B1362F]'
            : fileData.type === 'text/plain'
              ? 'bg-[#372297bf]'
              : 'bg-[#07378C]'
          : 'bg-[#07378C]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* File Icon */}
        <Image
          src={
            typeof file === 'string'
              ? getIconPath(getFileDetails(file))
              : getIconPath(fileData as { name: string; type: string })
          }
          width={30}
          height={30}
          alt="Document"
        />

        <div className="flex flex-col">
          {/* File Name */}
          <span className={cn('font-normal text-sm text-white', titleColor)}>
            {'name' in fileData ? fileData.name : ''}
          </span>

          {/* File Size & Upload Status */}
          {showExtraInfo && (
            <span className="text-xs text-white">
              {convertSizeToReadable('size' in fileData ? fileData.size : 0)}
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
        // For backend files (with a URL), enable downloading by wrapping the button in an anchor.
        'url' in fileData && fileData.url ? (
          <a
            href={fileData.url}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-background/20 text-gray-dark"
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="sr-only">Download file</span>
            </Button>
          </a>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-background/20 text-gray-dark"
          >
            <DownloadIcon className="h-4 w-4" />
            <span className="sr-only">Download file</span>
          </Button>
        )
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
