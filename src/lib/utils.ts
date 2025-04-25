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
 * Replace segments matching the plain-text `original` phrase in the editor's HTML
 * with the provided `suggestionHtml`. Allows for arbitrary HTML tags between words
 * in the original phrase match.
 *
 * **Limitation:** This replaces the *exact matched segment*. If `suggestionHtml`
 * represents a different block level (e.g., an `<li>`) than the matched content,
 * it might lead to invalid HTML structure. It does not automatically replace
 * the parent block element.
 *
 * @param editor The Tiptap editor instance.
 * @param original The plain text phrase to find (case-insensitive). Should not be empty.
 * @param suggestionHtml The HTML string to replace the matched segment with.
 */
export function applySuggestionAcross(
  editor: TipTapEditor,
  original: string | null | undefined,
  suggestionHtml: string // This is expected to be an HTML string
): void {
  if (!editor || editor.isDestroyed) {
    console.warn(
      'applySuggestionAcross: Editor is not available or destroyed.'
    );
    return;
  }

  // 1. Validate inputs
  if (!original || original.trim().length === 0) {
    console.warn('applySuggestionAcross: Original text is empty or invalid.');
    return;
  }

  // 2. Get current editor state
  const { state } = editor;
  const html = editor.getHTML(); // Get HTML for regex matching

  console.log('applySuggestionAcross: Finding:', original);
  console.log(
    'applySuggestionAcross: Replacing matched HTML segment with suggestion HTML:',
    suggestionHtml
  );

  // 3. Prepare the regular expression to find the original text segment
  const words = original.trim().split(/\s+/).map(escapeRx).filter(Boolean);
  if (!words.length) {
    console.warn(
      'applySuggestionAcross: No valid words found in original text.'
    );
    return;
  }

  // Regex to find the words separated by whitespace or any HTML tag(s),
  // optionally enclosed within <mark> tags.
  const separatorPattern = '(?:\\s+|<[^>]+>)+';
  const coreWordSequence = words.join(separatorPattern);
  const pattern =
    `(?:<mark(?:\\s+[^>]*)?>\\s*?)?` + // Optional opening <mark> (non-capturing)
    `(${coreWordSequence})` + // Capture the core sequence (group 1) for validation
    `(?:\\s*?</mark>)?`; // Optional closing <mark> (non-capturing)

  const re = new RegExp(pattern, 'gi'); // Global, case-insensitive

  // 4. Perform replacement using the RegExp on the HTML string
  let replaced = false;
  let matchCount = 0;
  const newHtml = html.replace(re, (match) => {
    matchCount++;
    // --- Validation Step ---
    const simpleOriginal = original.trim().replace(/\s+/g, ' ').toLowerCase();
    const simpleMatchContent = match
      .replace(/<[^>]+>/g, ' ') // Strip tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();

    // Validate if the text content of the match includes the original text
    if (simpleMatchContent.includes(simpleOriginal)) {
      console.log(
        `applySuggestionAcross: Match ${matchCount} validated. Replacing matched HTML segment.`
      );
      replaced = true;
      // Return the suggestionHtml to replace the entire 'match' string
      return suggestionHtml;
    } else {
      console.warn(
        `applySuggestionAcross: Match ${matchCount} validation failed. Skipping replacement.`,
        `\nMatch Content (stripped): "${simpleMatchContent}"`,
        `\nOriginal (simplified): "${simpleOriginal}"`
      );
      // Return the original match if validation fails to avoid incorrect replacement
      return match;
    }
  });

  // 5. Update editor only if changes were made
  if (!replaced) {
    console.log(
      'applySuggestionAcross: No valid replacements were made in the HTML.'
    );
    return; // Exit if no replacements occurred
  }

  console.log(
    'applySuggestionAcross: HTML content was modified. Updating editor.'
  );

  // 6. Update the editor's content and handle selection
  try {
    // Remember selection BEFORE changing content
    const { from, to } = state.selection;

    // Use setContent to replace the entire editor content with the modified HTML
    // Pass 'true' to trigger parsing and update events.
    editor.commands.setContent(newHtml, true);

    // Attempt to restore selection asynchronously
    setTimeout(() => {
      if (editor && !editor.isDestroyed && editor.view) {
        const currentDoc = editor.state.doc;
        // Cap the selection range to the new document size
        const newFrom = Math.min(from, currentDoc.content.size);
        const newTo = Math.min(to, currentDoc.content.size);
        // Ensure from <= to
        const finalFrom = Math.min(newFrom, newTo);
        const finalTo = Math.max(newFrom, newTo);

        try {
          const selection = TextSelection.create(
            currentDoc,
            finalFrom,
            finalTo
          );
          // Use a transaction to set selection and scroll
          const tr = editor.state.tr.setSelection(selection);
          // Only scroll if the selection changed or might be off-screen
          if (!state.selection.eq(selection)) {
            tr.scrollIntoView();
          }
          editor.view.dispatch(tr);
          console.log(
            'applySuggestionAcross: Selection restoration attempted.'
          );
        } catch (selectionError) {
          console.error(
            'applySuggestionAcross: Error creating/setting selection:',
            selectionError
          );
          editor.commands.focus('end'); // Fallback focus
        }
      }
    }, 50); // 50ms delay - adjust if needed
  } catch (updateError) {
    console.error(
      'applySuggestionAcross: Error setting editor content:',
      updateError
    );
  }
}

/**
 * Represents a token extracted from the HTML string.
 */
interface HtmlToken {
  text: string;
  type: 'word' | 'tag' | 'whitespace' | 'other';
  startIndex: number;
  endIndex: number; // Index *after* the last character of the token
}

/**
 * Finds the next token (word, tag, whitespace, or other sequence) in the HTML string.
 * @param html The HTML string to search within.
 * @param startIndex The index to start searching from.
 * @returns An HtmlToken object or null if end of string is reached.
 */
function getNextToken(html: string, startIndex: number): HtmlToken | null {
  if (startIndex >= html.length) {
    return null;
  }

  const firstChar = html[startIndex];

  // 1. Check for HTML Tag
  if (firstChar === '<') {
    const tagEndIndex = html.indexOf('>', startIndex);
    if (tagEndIndex !== -1) {
      const endIndex = tagEndIndex + 1;
      return {
        text: html.substring(startIndex, endIndex),
        type: 'tag',
        startIndex: startIndex,
        endIndex: endIndex,
      };
    } else {
      // Malformed tag or just '<' literal - treat as 'other'
      return {
        text: firstChar,
        type: 'other',
        startIndex: startIndex,
        endIndex: startIndex + 1,
      };
    }
  }

  // 2. Check for Whitespace sequence
  const whitespaceMatch = html.substring(startIndex).match(/^\s+/);
  if (whitespaceMatch) {
    const text = whitespaceMatch[0];
    const endIndex = startIndex + text.length;
    return {
      text: text,
      type: 'whitespace',
      startIndex: startIndex,
      endIndex: endIndex,
    };
  }

  // 3. Check for Word sequence (non-tag, non-whitespace)
  // We can define a "word" as a sequence of non-whitespace, non-'<' characters.
  let wordEndIndex = startIndex;
  while (
    wordEndIndex < html.length &&
    html[wordEndIndex] !== '<' &&
    !/\s/.test(html[wordEndIndex])
  ) {
    wordEndIndex++;
  }

  if (wordEndIndex > startIndex) {
    return {
      text: html.substring(startIndex, wordEndIndex),
      type: 'word',
      startIndex: startIndex,
      endIndex: wordEndIndex,
    };
  }

  // 4. Fallback for any other single character not caught above (should be rare)
  return {
    text: firstChar,
    type: 'other',
    startIndex: startIndex,
    endIndex: startIndex + 1,
  };
}

/**
 * Highlights occurrences of target *word sequences* within an HTML string
 * by wrapping matching segments with <mark> tags. It handles HTML tags and
 * whitespace between words by including them within the mark if they are
 * part of a successful match sequence.
 *
 * NOTE: This is a string-based approach using tokenization and may have
 * limitations with complex HTML structures or nested marks compared to
 * DOM manipulation. It processes results sequentially. Matching is case-insensitive.
 *
 * @param htmlContent The initial HTML string.
 * @param results An array of ComplianceResult objects. Each result's `original`
 * field specifies a complete text sequence (multiple words potentially)
 * to find and highlight.
 * @returns The processed HTML string with highlights.
 */
export function addMarksToHtmlContent(
  htmlContent: string,
  results: ComplianceResult[]
): string {
  if (!htmlContent || !results || results.length === 0) {
    return htmlContent;
  }

  const resultsToHighlight = results.filter(
    (
      r
    ): r is ComplianceResult & { original: string } => // Type guard
      !r.compliant &&
      typeof r.original === 'string' &&
      r.original.trim().length > 0 // Ensure non-empty after trim
  );

  if (resultsToHighlight.length === 0) {
    return htmlContent;
  }

  let processedHtml = htmlContent;

  // Process each result sequentially
  resultsToHighlight.forEach((result) => {
    // Split target into words, filtering empty strings from multiple spaces
    const targetWords = result.original.trim().split(/\s+/).filter(Boolean);
    if (targetWords.length === 0) return; // Skip if target is only whitespace

    const currentHtml = processedHtml; // Work on the output of the previous result
    let newHtml = ''; // Build the output for this result
    let i = 0; // Current index within currentHtml

    // State for tracking the multi-word match
    let targetWordIndex = 0; // Index into targetWords we are currently trying to match
    let potentialMatchTokens: HtmlToken[] = []; // Tokens accumulated for a potential match
    let inPotentialMatch = false; // Are we accumulating tokens for a possible match?

    while (i < currentHtml.length) {
      const token = getNextToken(currentHtml, i);
      if (!token) break; // End of string

      let processedToken = false; // Flag to check if token was handled in match logic

      if (inPotentialMatch) {
        // --- Inside a potential match ---
        if (token.type === 'word') {
          // Compare with the next expected target word (case-insensitive)
          if (
            targetWordIndex < targetWords.length &&
            token.text.toLowerCase() ===
              targetWords[targetWordIndex].toLowerCase()
          ) {
            // Word matches the expected word in the sequence
            potentialMatchTokens.push(token);
            targetWordIndex++;

            if (targetWordIndex === targetWords.length) {
              // *** Full Match Found! ***
              // Add the opening mark
              newHtml += '<mark style="background-color: #ff000077;">';
              // Add all the tokens that formed the match
              potentialMatchTokens.forEach((t) => (newHtml += t.text));
              // Add the closing mark
              newHtml += '</mark>';

              // Reset state for the next potential match
              inPotentialMatch = false;
              potentialMatchTokens = [];
              targetWordIndex = 0;
              processedToken = true; // Mark token as handled
            }
            // else: continue potential match, waiting for next word
          } else {
            // Word mismatch: The potential match failed.
            // Append the previously accumulated tokens *without* marks
            potentialMatchTokens.forEach((t) => (newHtml += t.text));
            // Reset state
            inPotentialMatch = false;
            potentialMatchTokens = [];
            targetWordIndex = 0;
            // IMPORTANT: The current token caused the mismatch,
            // so it needs to be processed normally *now* (in the !inPotentialMatch block below)
            // Do *not* set processedToken = true here.
          }
        } else if (token.type === 'tag' || token.type === 'whitespace') {
          // Tags or whitespace *between* matching words are part of the match.
          potentialMatchTokens.push(token);
          processedToken = true; // Mark token as handled (conditionally)
        } else {
          // 'other' token breaks the match sequence. Append previous tokens.
          potentialMatchTokens.forEach((t) => (newHtml += t.text));
          inPotentialMatch = false;
          potentialMatchTokens = [];
          targetWordIndex = 0;
          // Let the 'other' token be processed normally below.
        }
      }

      // --- Not inside a potential match OR potential match just failed ---
      if (!inPotentialMatch && !processedToken) {
        if (
          token.type === 'word' &&
          targetWords.length > 0 && // Ensure there are target words
          token.text.toLowerCase() === targetWords[0].toLowerCase() // Case-insensitive
        ) {
          // This word *could* be the start of a new match sequence
          inPotentialMatch = true;
          potentialMatchTokens = [token]; // Start accumulating
          targetWordIndex = 1; // We've matched the first word

          if (targetWordIndex === targetWords.length) {
            // Handle edge case: target sequence is only one word long
            newHtml += '<mark style="background-color: #ff000077;">';
            newHtml += token.text; // Add the single matching word
            newHtml += '</mark>';
            // Reset state
            inPotentialMatch = false;
            potentialMatchTokens = [];
            targetWordIndex = 0;
          }
          // Otherwise, continue hoping the next words match...
        } else {
          // Token is not a word, or it doesn't start the target sequence. Append normally.
          newHtml += token.text;
        }
      }

      // Advance the main index
      i = token.endIndex;
    } // End while loop

    // If the loop ends while still in a potential match (e.g., HTML ends mid-sequence),
    // the match failed. Append the accumulated tokens without marks.
    if (inPotentialMatch) {
      potentialMatchTokens.forEach((t) => (newHtml += t.text));
    }

    // Update processedHtml for the next iteration or final return
    processedHtml = newHtml;
  }); // End forEach result

  return processedHtml;
}
