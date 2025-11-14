import { clsx, type ClassValue } from 'clsx';
import { DateRange } from 'react-day-picker';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function validateFile(
  file: File,
  maxSize?: number,
  allowedTypes?: string[]
): string | null {
  if (maxSize && file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`;
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }

  return null;
}

export function convertSizeToReadable(size: number): string {
  if (size < 1024) return '1.00 KB'; // Minimum unit is KB

  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(size) / Math.log(1024)) - 1; // Adjust index to start from KB
  const readableSize = (size / Math.pow(1024, i + 1)).toFixed(2); // Convert size to the appropriate unit

  return `${readableSize} ${units[i]}`;
}

export function formatDate(inputDate: string): string {
  const date = new Date(inputDate);
  const now = new Date();

  // Check if it's the same day
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    // Return time in HH:mm format
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Return full date and time for earlier days
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const formatDateLocal = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];
  return `${day} ${month} ${year}`;
};

export const downloadDocument = (
  binaryData: string,
  fileName: string,
  mimeType: string
) => {
  // Convert base64/binary string to a Blob
  const byteCharacters = atob(binaryData); // Decode base64
  const byteNumbers = new Array(byteCharacters.length)
    .fill(0)
    .map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // Create a download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Function to get the default date range (one month before today)
export const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return { from: oneMonthAgo, to: today };
};

export function shortenText(text: string, wordLimit = 50) {
  return text.split(/\s+/).slice(0, wordLimit).join(' ') + '...';
}

export function preprocessMarkdown(text: string): string {
  if (!text) {
    return '';
  }

  let processedText = text;

  // 1. Normalize line endings to LF
  processedText = processedText.replace(/\r\n/g, '\n');

  // --- Table formatting patch start ---
  // Replace all non-breaking spaces with regular spaces
  processedText = processedText.replace(/\u00A0/g, ' ');

  // Ensure blank line before and after tables
  processedText = processedText.replace(/([^\n])\n(\|[^\n]*\|)/g, '$1\n\n$2');
  processedText = processedText.replace(/(\|[^\n]*\|)\n([^\n])/g, '$1\n\n$2');
  // Remove leading spaces before first pipe in table lines
  processedText = processedText.replace(/\n\s+\|/g, '\n|');
  // Remove trailing spaces after last pipe in table lines
  processedText = processedText.replace(/\|\s+\n/g, '|\n');

  // For every line with at least two pipes, ensure it starts and ends with a pipe
  processedText = processedText
    .split('\n')
    .map((line) => {
      const pipeCount = (line.match(/\|/g) || []).length;
      if (pipeCount >= 2) {
        let trimmed = line.trim();
        // Remove extra spaces before/after pipes
        trimmed = trimmed.replace(/\s*\|\s*/g, ' | ');
        // Ensure starts with pipe
        if (!trimmed.startsWith('|')) trimmed = '| ' + trimmed;
        // Ensure ends with pipe
        if (!trimmed.endsWith('|')) trimmed = trimmed + ' |';
        return trimmed;
      }
      return line;
    })
    .join('\n');
  // --- Table formatting patch end ---

  // 2. Clamp headers to a maximum of 6 levels (e.g., "####### Heading" -> "###### Heading")
  processedText = processedText.replace(/^(#{7,})\s*(.*)/gm, '###### $2');

  // 3. Remove trailing hashes from headings (e.g., "### Heading ###" -> "### Heading")
  processedText = processedText.replace(/^(#{1,6})(.*?)\s*#+\s*$/gm, '$1$2');

  // 4. Normalize headings with leading numbers (e.g., "## 1. Heading" -> "## Heading")
  processedText = processedText.replace(/^(#{1,6})\s*\d+\.\s*/gm, '$1 ');

  // 5. Ensure there is a space after heading hashes (e.g., "###Heading" -> "### Heading")
  processedText = processedText.replace(/^(#{1,6})([^#\s\n].*)/gm, '$1 $2');

  // 6. Remove lines that contain multiple, invalid heading markers (e.g., "## ## Something")
  processedText = processedText.replace(/^#+\s+#+\s+.*$/gm, '');

  // 7. Remove lines that are only hashes or invalid lone "#" characters
  processedText = processedText.replace(/^#+\s*$/gm, '');

  // 8. Collapse 3 or more consecutive newlines into just 2
  processedText = processedText.replace(/\n{3,}/g, '\n\n');

  // 9. Add extra newlines after block elements for ChatGPT-like spacing
  // After code blocks
  processedText = processedText.replace(/(```[\s\S]*?```)/g, '$1\n\n');
  // After blockquotes
  processedText = processedText.replace(/(\n>.*(?:\n>.*)*)/g, '$1\n\n');
  // After tables
  processedText = processedText.replace(/(\n\|.*\|\n(?:\|.*\|\n)+)/g, '$1\n\n');
  // After lists
  processedText = processedText.replace(
    /((?:^|\n)(?:\s*[-*+] |\d+\. ).*(?:\n(?:\s*[-*+] |\d+\. ).*)*)/gm,
    '$1\n\n'
  );

  // 10. Ensure paragraphs are separated by at least two newlines
  processedText = processedText.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');

  // 11. Auto-link URLs (http, https, www)
  processedText = processedText.replace(
    /(?<!\]\()((https?:\/\/|www\.)[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![\w\-.]*\])/gi,
    (match) => {
      // Don't double-link if already inside a markdown link
      if (/^https?:\/\//.test(match) || /^www\./.test(match)) {
        return `[${match}](${match.startsWith('http') ? match : 'https://' + match})`;
      }
      return match;
    }
  );

  // 12. Auto-link emails
  processedText = processedText.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    '[$1](mailto:$1)'
  );

  // 13. Clean up extra spaces before/after code blocks and lists
  processedText = processedText.replace(/\n{3,}/g, '\n\n');
  processedText = processedText.replace(/^\s+|\s+$/g, '');

  // 14. Final trim
  processedText = processedText.trim();

  // Debug log for inspection
  if (process.env.NODE_ENV !== 'production') {
    console.log('[preprocessMarkdown] Processed markdown:', processedText);
  }

  return processedText;
}

export function normalizeTables(md: string): string {
  const lines = md.split('\n');
  let inTable = false;
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 2) {
      // Start of a table block
      if (!inTable) {
        if (result.length && result[result.length - 1].trim() !== '')
          result.push('');
        inTable = true;
      }
      // Ensure line starts and ends with a single pipe
      let normalized = line.trim();
      if (!normalized.startsWith('|')) normalized = '| ' + normalized;
      if (!normalized.endsWith('|')) normalized = normalized + ' |';
      // Remove extra spaces before/after pipes
      normalized = normalized.replace(/\s*\|\s*/g, ' | ');
      result.push(normalized);
    } else {
      if (inTable) {
        // End of table block
        if (result.length && result[result.length - 1].trim() !== '')
          result.push('');
        inTable = false;
      }
      result.push(line);
    }
  }
  return result.join('\n');
}

// Test markdown table for debugging (uncomment to use in your chat bubble)
// const testTable = `
// | Name | Age | City |
// |------|-----|------|
// | Alice | 30 | London |
// | Bob | 25 | Manchester |
// `;

export function isValidMarkdown(text: string): boolean {
  // Even number of triple-backticks?
  const codeFenceCount = (text.match(/```/g) || []).length;
  if (codeFenceCount % 2 !== 0) return false;
  // Even number of inline backticks?
  const inlineCodeCount = (text.match(/`/g) || []).length;
  if (inlineCodeCount % 2 !== 0) return false;
  // Balanced brackets and parentheses?
  const openBr = (text.match(/\[/g) || []).length;
  const closeBr = (text.match(/\]/g) || []).length;
  if (openBr !== closeBr) return false;
  const openPar = (text.match(/\(/g) || []).length;
  const closePar = (text.match(/\)/g) || []).length;
  if (openPar !== closePar) return false;
  // Optionally: check for table row completeness, etc.
  return true;
}

export function processStreamingMarkdownChunk(
  accumulated: string,
  newChunk: string,
  previousValid: string = ''
): string {
  const updated = accumulated + newChunk;
  if (isValidMarkdown(updated)) {
    return updated;
  }
  // If not valid, return the previous valid content
  return previousValid;
}

// Authority color utilities
export type AuthorityValue = 'SRA' | 'LAA' | 'AML' | null;

export function getAuthorityColor(authority: AuthorityValue): string {
  switch (authority) {
    case 'SRA':
      return 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:bg-yellow-100 border-yellow-300';
    case 'LAA':
      return 'text-green-700 bg-green-50 hover:bg-green-100 focus:bg-green-100 border-green-300';
    case 'AML':
      return 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100 focus:bg-cyan-100 border-cyan-300';
    default:
      return 'text-gray-600 bg-gray-200 hover:bg-gray-300 focus:bg-gray-100 border-gray-300';
  }
}

export function getAuthorityOptionColor(authority: AuthorityValue): string {
  switch (authority) {
    case 'SRA':
      return 'hover:bg-yellow-50 focus:bg-yellow-50 data-[state=checked]:bg-yellow-100';
    case 'LAA':
      return 'hover:bg-green-50 focus:bg-green-50 data-[state=checked]:bg-green-100';
    case 'AML':
      return 'hover:bg-cyan-50 focus:bg-cyan-50 data-[state=checked]:bg-cyan-100';
    default:
      return 'hover:bg-gray-50 focus:bg-gray-50';
  }
}

export function getAuthorityTextColor(authority: AuthorityValue): string {
  switch (authority) {
    case 'SRA':
      return 'text-yellow-700';
    case 'LAA':
      return 'text-green-700';
    case 'AML':
      return 'text-cyan-700';
    default:
      return 'text-blue-800';
  }
}
