'use client';

import { useState } from 'react';
import { CheckCircle, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  content: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true); // Show the check icon
      setTimeout(() => setCopied(false), 2000); // Revert after 2 seconds
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
        <CheckCircle className="w-4 h-4 text-gray-dark" /> // Check icon
      ) : (
        <Copy className="w-4 h-4 text-gray-dark" /> // Copy icon
      )}
    </Button>
  );
};

export default CopyButton;
