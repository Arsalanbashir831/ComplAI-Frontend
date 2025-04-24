
import { clsx, type ClassValue } from 'clsx';
import { TextSelection } from 'prosemirror-state';
import { DateRange } from 'react-day-picker';
import { twMerge } from 'tailwind-merge';


import { Editor as TipTapEditor } from '@tiptap/react';

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

// export function applySuggestionAcross(
//   editor: Editor,
//   original: string,
//   suggestion: string
// ) {
//   const { state, view } = editor;
//   let tr = state.tr;

//   // Escape special regex chars in the original string
//   const esc = original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

//   // Global regex, but we will run it on each text node separately
//   const regex = new RegExp(esc, 'g');

//   // Collect all matches: { from, to }
//   const matches: Array<{ from: number; to: number }> = [];

//   state.doc.descendants((node, pos) => {
//     if (!node.isText) return true;

//     const text = node.text || '';
//     let m: RegExpExecArray | null;

//     // Reset lastIndex so each node starts at 0
//     regex.lastIndex = 0;

//     while ((m = regex.exec(text)) !== null) {
//       const startInNode = m.index;
//       const endInNode = startInNode + original.length;
//       matches.push({
//         from: pos + startInNode,
//         to: pos + endInNode,
//       });
//       // Move on in this node
//       regex.lastIndex = m.index + original.length;
//     }

//     return true;
//   });

//   if (matches.length === 0) return;

//   // Apply replacements in reverse document order
//   for (let i = matches.length - 1; i >= 0; i--) {
//     const { from, to } = matches[i];
//     tr = tr.replaceWith(from, to, state.schema.text(suggestion));
//   }

//   if (tr.docChanged) {
//     // restore the original selection (or you could collapse to last replace)
//     tr = tr.setSelection(
//       TextSelection.create(
//         tr.doc,
//         view.state.selection.from,
//         view.state.selection.to
//       )
//     );
//     view.dispatch(tr.scrollIntoView());
//   }
// }

/** Escape regex metachars */
export function escapeRx(s: string): string {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Replace every occurrence of `original` (plain-text) in the **HTML** of the editor
 * with `suggestion`, allowing arbitrary tags between plain-text words.
 */
export function applySuggestionAcross(
  editor: TipTapEditor,
  original: string,
  suggestion: string
) {
  // 1. Get the current HTML
  const html = editor.getHTML();

  // 2. Break original into words and build a tolerant regex
  const words = original
    .trim()
    .split(/\s+/)
    .map(escapeRx)
    .filter(Boolean);
  if (!words.length) return;

  // e.g. /(word1)(?:\s|<[^>]+>)+(word2)(?:\s|<[^>]+>)+(word3)/gi
  const pattern = words.join('(?:\\s|<[^>]+>)+');
  const re = new RegExp(pattern, 'gi');

  // 3. Replace in the HTML
  const newHtml = html.replace(re, suggestion);

  // 4. Remember the current selection
  const { from, to } = editor.state.selection;

  // 5. Re-set the editor content (this parses the HTML back into ProseMirror nodes)
  editor.commands.setContent(newHtml);

  // 6. Restore the original selection in the new document
  editor.view.dispatch(
    editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from, to))
      .scrollIntoView()
  );
}