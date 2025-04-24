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
  original: string | null | undefined,
  suggestion: string
): void {
  // Explicitly void return type
  // 1. Get the current HTML content from the editor
  const html = editor.getHTML();
  console.log('applySuggestionAcross: Original HTML:', html);
  console.log('applySuggestionAcross: Finding:', original);
  console.log('applySuggestionAcross: Replacing with:', suggestion);

  // 2. Prepare the regular expression
  if (!original) {
    console.warn('applySuggestionAcross: Original text is null or undefined.');
    return;
  }

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
