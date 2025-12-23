'use client';

import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ResponseTab = 'chat' | 'points';

interface ResponseTabsProps {
  activeTab: ResponseTab;
  onTabChange: (tab: ResponseTab) => void;
}

export function ResponseTabs({ activeTab, onTabChange }: ResponseTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as ResponseTab)}
      className="w-full max-w-[300px] mx-auto"
    >
      <TabsList className="flex bg-[#F5F8FF] rounded-lg w-full border border-[#DFEAFF] p-0 h-auto">
        <TabsTrigger
          value="chat"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-r-none transition-all duration-200 font-medium text-sm border-0',
            'data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm',
            'data-[state=inactive]:text-[#04338B] data-[state=inactive]:hover:bg-white/50'
          )}
        >
          <div
            className="w-4 h-4 bg-current [mask-image:url(/icons/chat-tick.svg)] [mask-size:contain] [mask-repeat:no-repeat] shrink-0"
            aria-hidden="true"
          />
          Chat
        </TabsTrigger>
        <TabsTrigger
          value="points"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-l-none transition-all duration-200 font-medium text-sm border-0',
            'data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm',
            'data-[state=inactive]:text-[#04338B] data-[state=inactive]:hover:bg-white/50'
          )}
        >
          <div
            className="w-4 h-4 bg-current [mask-image:url(/icons/bulb.svg)] [mask-size:contain] [mask-repeat:no-repeat] shrink-0"
            aria-hidden="true"
          />
          Key Points
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
