import Image from 'next/image';
import { SquareArrowOutUpRight, X } from 'lucide-react';

import type { FileCardProps } from '@/types/upload';
import { cn, convertSizeToReadable } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FileCard({
  file,
  showExtraInfo = true,
  onRemove,
  titleColor,
  hasShareButton,
  className,
}: FileCardProps) {
  const getIconPath = (fileType: string): string => {
    const fileTypeMap: Record<string, string> = {
      pdf: 'pdf-document',
      plain: 'plain-document',
      'vnd.openxmlformats-officedocument.wordprocessingml.document':
        'word-document',
    };

    const key = fileType.split('/')[1]; // Extract suffix from MIME type
    return `/icons/${fileTypeMap[key] || 'plain-document'}.svg`; // Fallback to 'plain-document'
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg p-3',
        file.type === 'application/pdf' ? 'bg-[#B1362F]' : 'bg-[#07378C]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Image
          src={getIconPath(file.type)}
          width={30}
          height={30}
          alt="Document"
        />
        <div className="flex flex-col">
          <span className={cn('font-normal text-sm text-white', titleColor)}>
            {file.name}
          </span>
          {showExtraInfo && (
            <span className="text-xs text-white">
              {convertSizeToReadable(file.size)}
              <span className="ml-2">
                {(file.progress ?? 100) < 100 ? ` Uploading...` : 'Completed'}
              </span>
            </span>
          )}
        </div>
      </div>

      {hasShareButton ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/20 text-gray-dark"
        >
          <SquareArrowOutUpRight className="h-4 w-4" />
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
