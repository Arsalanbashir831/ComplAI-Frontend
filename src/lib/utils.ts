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

  // 2. Clamp headers to a maximum of 6 levels (e.g., "####### Heading" -> "###### Heading")
  // This also captures the heading text to preserve it.
  processedText = processedText.replace(/^(#{7,})\s*(.*)/gm, '###### $2');

  // 3. Remove trailing hashes from headings (e.g., "### Heading ###" -> "### Heading")
  // This cleans up a common copy-paste error from some editors.
  processedText = processedText.replace(/^(#{1,6})(.*?)\s*#+\s*$/gm, '$1$2');

  // 4. Normalize headings with leading numbers (e.g., "## 1. Heading" -> "## Heading")
  // This correctly preserves the heading level and adds a space.
  processedText = processedText.replace(/^(#{1,6})\s*\d+\.\s*/gm, '$1 ');

  // 5. Ensure there is a space after heading hashes (e.g., "###Heading" -> "### Heading")
  // This is a requirement for many Markdown parsers to recognize a heading.
  processedText = processedText.replace(/^(#{1,6})([^#\s\n].*)/gm, '$1 $2');

  // 6. Remove lines that contain multiple, invalid heading markers (e.g., "## ## Something")
  processedText = processedText.replace(/^#+\s+#+\s+.*$/gm, '');

  // 7. Remove lines that are only hashes or invalid lone "#" characters
  processedText = processedText.replace(/^#+\s*$/gm, '');

  // 8. Collapse 3 or more consecutive newlines into just 2
  processedText = processedText.replace(/\n{3,}/g, '\n\n');

  processedText=processedText.replace(/\s*###(?=\d+\.\s*)/g, '\n\n').trim();
  // 9. Trim leading/trailing whitespace from the entire text
  return processedText.trim();
}