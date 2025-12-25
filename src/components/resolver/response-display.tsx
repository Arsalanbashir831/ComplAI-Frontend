'use client';

import { useState } from 'react';
import { CheckCircle, CloudUpload, Copy } from 'lucide-react';

import { MarkdownRenderer } from '@/lib/markdown';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Button } from '../ui/button';

interface ResponseDisplayProps {
  /** The full markdown content from AI response */
  content: string;
  onExport?: () => void;
}

/**
 * Main response display component showing the AI-generated letter.
 * Displays the response in a professional letter format with action buttons.
 * Uses MarkdownRenderer for markdown content.
 */
export function ResponseDisplay({ content, onExport }: ResponseDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="flex-1 bg-white border-0 shadow-none rounded-xl flex flex-col overflow-hidden">
      {/* Action Buttons - Top Right */}
      <div className="flex items-center justify-end gap-3 px-8 pt-6">
        {/* Copy to Clipboard Button */}
        <Button
          onClick={handleCopy}
          className="flex items-center gap-[2px] shadow-none bg-[#F5F8FF] hover:bg-[#E8EDFF] px-3 py-[5px] rounded-[6px] transition-colors"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-[#04338B]" />
          ) : (
            <Copy className="h-4 w-4 text-[#04338B]" />
          )}
          <span className="text-[11.25px] font-medium text-[#04338B] font-poppins leading-[19.5px]">
            Copy to Clipboard
          </span>
        </Button>

        {/* Export PDF Button */}
        <Button
          onClick={onExport}
          className="flex items-center gap-2 shadow-none bg-[#B1362F] hover:bg-[#9A2F29] border border-[#B1362F] h-fit px-3 py-[5px] rounded-[6px] transition-colors"
        >
          <CloudUpload className="h-3 w-3 text-white" />
          <span className="text-[11.25px] font-normal text-white font-poppins leading-[19.5px]">
            Export PDF
          </span>
        </Button>
      </div>

      {/* Letter Content */}
      <ScrollArea className="flex-1 px-8 py-6">
        <div className="text-[#39393A] text-sm">
          <MarkdownRenderer content={content} />
        </div>
      </ScrollArea>
    </Card>
  );
}
