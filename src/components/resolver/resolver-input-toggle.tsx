'use client';

import { FileText, Type } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ResolverMode = 'documents' | 'text';

interface ResolverInputToggleProps {
  mode: ResolverMode;
  onModeChange: (mode: ResolverMode) => void;
}

/**
 * ResolverInputToggle
 *
 * Uses Shadcn Tabs styled to match Figma design.
 * - Active state: bg-primary, text-white
 * - Inactive state: bg-[#f5f8ff], border-2 border-[#04338B], text-[#04338B]
 */
export function ResolverInputToggle({
  mode,
  onModeChange,
}: ResolverInputToggleProps) {
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => onModeChange(value as ResolverMode)}
      className="w-full mb-8"
    >
      <TabsList className="bg-transparent p-0 flex gap-5 h-auto justify-start">
        <TabsTrigger
          value="documents"
          className={cn(
            'flex items-center gap-3 px-6 py-1.5 h-fit rounded-lg border-2 transition-all font-semibold font-poppins text-lg',
            'data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-white',
            'data-[state=inactive]:bg-[#f5f8ff] data-[state=inactive]:border-[#04338B] data-[state=inactive]:text-[#04338B] hover:opacity-80'
          )}
        >
          <FileText className="h-5 w-5" />
          Documents
        </TabsTrigger>
        <TabsTrigger
          value="text"
          className={cn(
            'flex items-center gap-3 px-6 py-1.5 h-fit rounded-lg border-2 transition-all font-semibold font-poppins text-lg',
            'data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-white',
            'data-[state=inactive]:bg-[#f5f8ff] data-[state=inactive]:border-[#04338B] data-[state=inactive]:text-[#04338B] hover:opacity-80'
          )}
        >
          <Type className="h-6 w-6" />
          Text
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
