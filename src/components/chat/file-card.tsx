import { DownloadIcon, X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { cn, convertSizeToReadable } from '@/lib/utils';
import type { FileCardProps, UploadedFile } from '@/types/upload';

/**
 * Type guard to check if a file is an UploadedFile
 */
const isUploadedFile = (file: UploadedFile | File): file is UploadedFile => {
  return (file as UploadedFile).progress !== undefined;
};

export function FileCard({
  file,
  showExtraInfo = true,
  onRemove,
  titleColor,
  hasShareButton,
  className,
}: FileCardProps) {
  /**
   * Determine the correct icon path based on the file type
   */
  const getIconPath = (file: UploadedFile | File): string => {
    const fileTypeMap: Record<string, string> = {
      pdf: 'pdf-document',
      plain: 'plain-document',
      docx: 'word-document',
      'vnd.openxmlformats-officedocument.wordprocessingml.document': 'word-document',
    };

    // Extract MIME type suffix
    const fileType = file.type || (typeof file === 'string' ? file.split('.').pop() : '');
    const key = fileType?.split('/')[1]; // Get the part after "application/" or "text/"

    return `/icons/${fileTypeMap[key] || 'plain-document'}.svg`; // Default to plain-document icon
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg p-3',
        file.type === 'application/pdf'
          ? 'bg-[#B1362F]'
          : file.type === 'text/plain'
          ? 'bg-[#372297bf]'
          : 'bg-[#07378C]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* File Icon */}
        <Image
          src={getIconPath(file)}
          width={30}
          height={30}
          alt="Document"
        />

        <div className="flex flex-col">
          {/* File Name */}
          <span className={cn('font-normal text-sm text-white', titleColor)}>
            {file.name}
          </span>

          {/* File Size & Upload Status */}
          {showExtraInfo && (
            <span className="text-xs text-white">
              {convertSizeToReadable(file.size)}
              <span className="ml-2">
                {isUploadedFile(file) && file.progress !== undefined && file.progress < 100
                  ? ` Uploading...`
                  : ' Completed'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Share or Remove */}
      {hasShareButton ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/20 text-gray-dark"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="sr-only">Share file</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/20 hover:text-white text-white"
          onClick={() => onRemove && onRemove(file.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove file</span>
        </Button>
      )}
    </div>
  );
}
