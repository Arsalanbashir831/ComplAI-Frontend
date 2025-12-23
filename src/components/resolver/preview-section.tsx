'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { Card } from '@/components/ui/card';

interface PreviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function PreviewSection({
  title,
  icon,
  children,
  defaultExpanded = true,
}: PreviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2"
      >
        <div className="flex items-center gap-3">
          <Card className="w-14 h-14 bg-primary border-none rounded-full flex items-center justify-center shrink-0">
            {icon}
          </Card>
          <h3 className="text-lg font-medium text-[#04338B]">{title}</h3>
        </div>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          {isExpanded ? (
            <Minus className="text-white h-4 w-4" />
          ) : (
            <Plus className="text-white h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && <div className="mt-4 pl-13">{children}</div>}
    </div>
  );
}
