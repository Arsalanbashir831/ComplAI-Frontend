'use client';

import { useState } from 'react';
import { CheckCircle, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  content: string;
}

// A simple helper to remove common markdown formatting
const stripMarkdown = (markdown: string): string => {
  return (
    markdown
      // Remove markdown headers (e.g., "# Heading")
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold and italic markers
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove strikethroughs
      .replace(/~~(.*?)~~/g, '$1')
      // Remove inline code markers
      .replace(/`([^`]+)`/g, '$1')
      // Convert markdown links [text](url) to just text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Remove image markdown ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim()
  );
};

const CopyButton: React.FC<CopyButtonProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Convert markdown content to plain text
    const textToCopy = stripMarkdown(content);

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="p-1 rounded-full h-fit w-fit"
      onClick={handleCopy}
    >
      {copied ? (
        <CheckCircle className="w-4 h-4 text-gray-dark" />
      ) : (
        <Copy className="w-4 h-4 text-gray-dark" />
      )}
    </Button>
  );
};

export default CopyButton;
