import Image from 'next/image';
import { X } from 'lucide-react';

import type { FileCardProps } from '@/types/upload';
import { cn, convertSizeToReadable } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FileCard({ file, type, onRemove }: FileCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg p-3',
        type === 'application/pdf' ? 'bg-[#B1362F]' : 'bg-[#07378C]'
      )}
    >
      <div className="flex items-center gap-3">
        <Image
          src={`/icons/${type.split('/')[1]}-document.svg`}
          width={30}
          height={30}
          alt="Document"
        />
        <div className="flex flex-col">
          <span className="font-normal text-sm text-white">{file.name}</span>
          <span className="text-xs text-white">
            {convertSizeToReadable(file.size)}
            <span className="ml-2">
              {(file.progress ?? 100) < 100 ? ` Uploading...` : 'Completed'}
            </span>
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-background/20 hover:text-white text-white"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
}
