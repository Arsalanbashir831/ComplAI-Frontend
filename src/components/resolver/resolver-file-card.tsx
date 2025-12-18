'use client';

import { FileText, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ResolverFileCardProps {
  name: string;
  size: string;
  status?: 'Uploading...' | 'Ready';
  onRemove: () => void;
}

export function ResolverFileCard({
  name,
  size,
  status = 'Ready',
  onRemove,
}: ResolverFileCardProps) {
  const isPdf = name.toLowerCase().endsWith('.pdf');

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl border transition-all mb-3',
        isPdf
          ? 'bg-[#b6302f] border-[#b6302f] text-white'
          : 'bg-[#153e90] border-[#153e90] text-white'
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center shrink-0">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-lg truncate leading-none mb-1">
            {name}
          </h4>
          <p className="text-white/70 text-sm">
            {size} {status}
          </p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
