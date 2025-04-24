// import { TextSelection } from '@tiptap/pm/state';
import { Editor as TipTapEditor } from '@tiptap/react';
import { clsx, type ClassValue } from 'clsx';
import { TextSelection } from 'prosemirror-state';
import { DateRange } from 'react-day-picker';
import { twMerge } from 'tailwind-merge';

import { ComplianceResult } from '@/types/doc-compliance';

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

/** Escape regex metachars */
export function escapeRx(s: string): string {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Replace every occurrence of `original` (plain-text) in the **HTML** of the editor
 * with `suggestion`, allowing arbitrary tags (including <mark>) between plain-text words.
 * Any <mark> tags within the matched segment will be removed as part of the replacement.
 *
 * @param editor The Tiptap editor instance.
 * @param original The plain text phrase to find (case-insensitive).
 * @param suggestion The plain text or HTML string to replace the original phrase with.
 */
export function applySuggestionAcross(
  editor: TipTapEditor,
  original: string,
  suggestion: string
): void {
  // Explicitly void return type
  // 1. Get the current HTML content from the editor
  const html = editor.getHTML();
  console.log('applySuggestionAcross: Original HTML:', html);
  console.log('applySuggestionAcross: Finding:', original);
  console.log('applySuggestionAcross: Replacing with:', suggestion);

  // 2. Prepare the regular expression
  // Break the original text into words, escape them for regex safety, and filter out empty strings
  const words = original.trim().split(/\s+/).map(escapeRx).filter(Boolean);

  // If there are no words to match, exit early
  if (!words.length) {
    console.warn(
      'applySuggestionAcross: Original text is empty or contains only whitespace.'
    );
    return;
  }

  // Build the regex pattern:
  // - Separator `(?:\\s+|<[^>]+>)+`: Matches one or more whitespace or any HTML tag between words.
  // - Core sequence: `words.join(separatorPattern)` matches the words with separators.
  // - Boundaries:
  //    - `(?:<mark(?:\\s+[^>]*)?>\\s*?)?`: Optionally matches an opening <mark> tag (with attributes)
  //      followed by optional non-greedy whitespace.
  //    - `(?:\\s*?</mark>)?`: Optionally matches non-greedy whitespace followed by a closing </mark> tag.
  // - The core sequence is captured in group $1, but we replace the entire match.
  const separatorPattern = '(?:\\s+|<[^>]+>)+';
  const coreWordSequence = words.join(separatorPattern);
  const pattern =
    `(?:<mark(?:\\s+[^>]*)?>\\s*?)?` + // Optional opening <mark> (with potential attributes) and optional space (non-greedy)
    `(${coreWordSequence})` + // Capture the actual word sequence (group 1)
    `(?:\\s*?</mark>)?`; // Optional space (non-greedy) and closing </mark>

  console.log('applySuggestionAcross: Regex pattern:', pattern);

  // Create the RegExp object:
  // - 'g': Global - find all matches, not just the first.
  // - 'i': Case-insensitive matching.
  const re = new RegExp(pattern, 'gi');

  // 3. Perform the replacement in the HTML string
  let replaced = false;
  const newHtml = html.replace(re, (match, capturedCoreSequence) => {
    console.log('applySuggestionAcross: Matched segment:', match);
    console.log('applySuggestionAcross: Captured core:', capturedCoreSequence); // Log the captured part
    // Double-check if the captured core roughly matches the original text content
    // (This is a basic sanity check, ignoring case and tags within the original)
    const simpleOriginal = original.trim().replace(/\s+/g, ' ');
    const simpleCaptured = capturedCoreSequence
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (simpleCaptured.toLowerCase() === simpleOriginal.toLowerCase()) {
      replaced = true; // Flag that at least one valid replacement occurred
      return suggestion; // Return the suggestion string for replacement
    } else {
      console.warn(
        'applySuggestionAcross: Captured content mismatch, skipping replacement for:',
        match
      );
      return match; // Return the original match if the core content doesn't seem right
    }
  });

  // 4. Check if any changes were actually made
  if (!replaced) {
    console.log(
      'applySuggestionAcross: No valid replacements made for the given original text.'
    );
    return; // Exit if no valid replacements occurred
  }

  console.log('applySuggestionAcross: New HTML:', newHtml);

  // 5. Remember the current selection (before updating content)
  const currentSelection = editor.state.selection;

  // 6. Update the editor's content
  editor.commands.setContent(newHtml, false); // Pass false to potentially improve selection restoration

  // 7. Attempt to restore the selection
  const newDocSize = editor.state.doc.content.size;
  const newFrom = Math.min(currentSelection.from, newDocSize);
  const newTo = Math.min(currentSelection.to, newDocSize);

  setTimeout(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        const selection = TextSelection.create(
          editor.state.doc,
          newFrom,
          newTo
        );
        editor.view.dispatch(
          editor.state.tr.setSelection(selection).scrollIntoView()
        );
        // Manually trigger an update event if setContent had emitUpdate: false
        editor.view.dispatch(editor.state.tr.setMeta('forceUpdate', true));
      } catch (error) {
        console.error(
          'applySuggestionAcross: Error restoring selection:',
          error
        );
        editor.commands.focus('end'); // Fallback focus
      }
    } else {
      console.warn(
        'applySuggestionAcross: Editor or view not available for selection restoration.'
      );
    }
  }, 0); // Timeout 0ms
}

/**
 * Wraps occurrences of specified original texts within an HTML string with <mark> tags.
 *
 * NOTE: This function uses simple string replacement and has limitations:
 * - It may fail or break HTML if 'original' text spans across tags.
 * - It may fail if 'original' text and HTML content use different HTML entities (e.g., & vs &amp;).
 * - It may fail due to whitespace differences.
 * - It performs a case-sensitive replacement.
 * - Using Tiptap decorations/marks via extensions is generally more robust.
 *
 * @param {string} htmlContent The initial HTML content string.
 * @param {Array<{original: string}>} results An array of objects, each with an 'original' string to find.
 * @returns {string} The HTML content with matches wrapped in <mark> tags.
 */
export function addMarksToHtmlContent(
  htmlContent: string,
  results: ComplianceResult[]
): string {
  if (!htmlContent || !results || results.length === 0) {
    return htmlContent;
  }

  let modifiedContent = htmlContent;

  results.forEach((result) => {
    const originalText = result.original;

    // Basic check to avoid trying to replace empty strings
    if (
      originalText &&
      typeof originalText === 'string' &&
      originalText.length > 0
    ) {
      try {
        // Escape special characters in the original text so it can be used in a RegExp
        // This handles characters like ., *, +, ?, ^, $, {, }, (, ), |, [, ], \
        const escapedOriginalText = originalText.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );

        // Create a regular expression to find all occurrences globally ('g' flag)
        // NOTE: This is case-sensitive. Add 'i' flag for case-insensitive: new RegExp(escapedOriginalText, 'gi')
        const regex = new RegExp(escapedOriginalText, 'g');

        // Replace found occurrences with the text wrapped in <mark> tags
        // Using a function in replace ensures that we don't accidentally replace parts of already added <mark> tags
        // if originalText contained '<' or '>'.
        modifiedContent = modifiedContent.replace(
          regex,
          (match) => (
            console.log(match),
            `<mark style="background-color: rgb(254, 202, 202);">${match}</mark>`
          )
        );
      } catch (error) {
        console.error(
          `Error creating or using RegExp for text: "${originalText}"`,
          error
        );
        // Continue with the next result even if one fails
      }
    }
  });

  return modifiedContent;
}
