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
 * Uses Shadcn Tabs styled to match Figma node 6:2982.
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
      <TabsList className="bg-transparent p-0 flex gap-4 h-auto">
        <TabsTrigger
          value="documents"
          className={cn(
            'flex items-center gap-2 px-[11.429px] py-[8.163px] h-[49px] w-[150px] rounded-[6.531px] border-2 transition-all font-semibold font-poppins text-[16px]',
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
            'flex items-center gap-2 px-[11.429px] py-[8.163px] h-[49px] w-[113px] rounded-[6.531px] border-2 transition-all font-semibold font-poppins text-[16px]',
            'data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-white',
            'data-[state=inactive]:bg-[#f5f8ff] data-[state=inactive]:border-[#04338B] data-[state=inactive]:text-[#04338B] hover:opacity-80'
          )}
        >
          <Type className="h-5 w-5" />
          Text
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
