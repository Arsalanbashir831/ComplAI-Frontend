import Image from 'next/image';
import { X } from 'lucide-react';

import type { FileCardProps } from '@/types/upload';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FileCard({ file, onRemove }: FileCardProps) {
  console.log(file);
  const isCompliance = file?.name?.toLowerCase().includes('compliance');

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg p-3',
        isCompliance ? 'bg-red-100' : 'bg-[#07378C]'
      )}
    >
      <div className="flex items-center gap-3">
        <Image
          src="/icons/word-icon.svg"
          width={24}
          height={24}
          alt="Document"
        />
        <span className="font-medium">{file.name}</span>
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
