// import { TextSelection } from '@tiptap/pm/state';
import {
  DOMParser,
  Node as ProseMirrorNode,
  Schema,
  Slice,
} from '@tiptap/pm/model';
import { TextSelection, Transaction } from '@tiptap/pm/state';
import { Editor as TipTapEditor } from '@tiptap/react';

/**
 * Helper to parse an HTML string into a ProseMirror Slice using the editor's schema.
 * @param html The HTML string to parse.
 * @param schema The ProseMirror schema from the editor state.
 * @returns A ProseMirror Slice representing the parsed HTML.
 * @throws Error if parsing fails.
 */
function parseHtmlToSlice(html: string, schema: Schema): Slice {
  const temp = document.createElement('div');
  // Trim the HTML slightly - might prevent issues with leading/trailing whitespace nodes
  temp.innerHTML = html.trim();
  const pmParser = DOMParser.fromSchema(schema);
  // parseSlice handles potentially multiple top-level nodes in the HTML string
  return pmParser.parseSlice(temp, {
    preserveWhitespace: 'full', // Adjust if whitespace handling needs tuning
    // context: contextSlice // You might need context for parsing things like table cells correctly
  });
}

/**
 * Finds occurrences of a plain text phrase within the Tiptap/ProseMirror document.
 * Returns an array of { from: number, to: number } ranges corresponding to matches.
 *
 * NOTE: This searches for the text content and might not perfectly replicate
 * the original function's regex flexibility across arbitrary HTML tags between words.
 * It works best for text within or across adjacent text nodes.
 *
 * @param doc The ProseMirror document node.
 * @param searchText The plain text to search for (case-insensitive).
 * @returns Array of {from, to} ranges.
 */
function findTextRanges(
  doc: ProseMirrorNode,
  searchText: string
): { from: number; to: number }[] {
  const ranges: { from: number; to: number }[] = [];
  const searchLower = searchText.toLowerCase().trim(); // Use trimmed, lowercase search text
  if (!searchLower) return ranges;

  let textContent = '';
  // Maps index in concatenated textContent back to ProseMirror position info
  const posMap: { pos: number; nodeSize: number }[] = [];

  // Build a concatenated text string and a map to track original positions
  doc.descendants((node, pos) => {
    if (node.isText) {
      const nodeText = node.text;
      if (nodeText) {
        // Store position info for each character in this text node
        for (let i = 0; i < nodeText.length; i++) {
          posMap[textContent.length + i] = { pos: pos + i, nodeSize: 1 };
        }
        textContent += nodeText;
      }
    } else if (
      node.isBlock &&
      textContent.length > 0 &&
      !textContent.endsWith(' ')
    ) {
      // Add a space marker for block boundaries to prevent merging words across blocks.
      // This helps find "word1 word2" even if word1 is at the end of one <p>
      // and word2 is at the start of the next.
      // Use a non-standard character or sequence if ' ' interferes with search text
      posMap[textContent.length] = { pos: pos, nodeSize: 0 }; // Mark position, 0 size
      textContent += ' '; // Use space as a block separator marker in textContent
    }
    // Return true to continue descending
    return true;
  });

  const textLower = textContent.toLowerCase();
  let searchStartIndex = 0;
  let index = -1;

  while ((index = textLower.indexOf(searchLower, searchStartIndex)) !== -1) {
    const endIndex = index + searchLower.length;

    // Ensure the calculated indices are valid within our position map
    if (index < posMap.length && endIndex > 0 && endIndex - 1 < posMap.length) {
      const fromPos = posMap[index].pos;
      // The 'to' position is the position *after* the last character of the match
      const lastCharMap = posMap[endIndex - 1];
      const toPos = lastCharMap.pos + lastCharMap.nodeSize; // End pos is start + size

      // Basic validation: Ensure 'from' is less than or equal to 'to'.
      if (fromPos < toPos) {
        // Use < strictly? Or <=? <= seems safer.
        ranges.push({ from: fromPos, to: toPos });
      } else if (fromPos === toPos && lastCharMap.nodeSize === 0) {
        // This might happen if the match aligns exactly with a zero-size marker (like block boundary)
        // Decide if zero-length matches are valid. Usually not intended.
        console.warn(
          'findTextRanges: Zero-length range detected at block boundary?',
          { fromPos, toPos }
        );
      } else {
        console.warn('findTextRanges: Invalid range detected (from >= to)', {
          index,
          endIndex,
          fromPos,
          toPos,
          lastCharMap,
        });
      }
    } else {
      console.warn(
        'findTextRanges: Match index out of bounds of position map.',
        {
          index,
          endIndex,
          posMapLength: posMap.length,
        }
      );
    }

    // Continue searching from the position immediately after the current match
    searchStartIndex = index + 1;
  }

  return ranges;
}

/**
 * Replace segments matching the plain-text `original` phrase in the editor
 * with the provided `suggestionHtml` using ProseMirror transactions.
 * Handles block/inline structural changes more reliably than HTML string replacement.
 *
 * @param editor The Tiptap editor instance.
 * @param original The plain text phrase to find (case-insensitive). Should not be empty.
 * @param suggestionHtml The HTML string to replace the matched segment with.
 */
export function applySuggestionAcross(
  editor: TipTapEditor,
  original: string | null | undefined,
  suggestionHtml: string
): void {
  if (!editor || editor.isDestroyed) {
    console.warn(
      'applySuggestionAcross: Editor is not available or destroyed.'
    );
    return;
  }

  if (!original || original.trim().length === 0) {
    console.warn('applySuggestionAcross: Original text is empty or invalid.');
    return;
  }

  const { state } = editor;
  const { doc, schema } = state;
  const trimmedOriginal = original.trim(); // Use trimmed version for search

  console.log('[applySuggestionAcross] Finding:', trimmedOriginal);
  console.log(
    '[applySuggestionAcross] Replacing with suggestion HTML:',
    suggestionHtml
  );

  // 1. Find ranges in the document model
  const ranges = findTextRanges(doc, trimmedOriginal);

  if (!ranges.length) {
    console.log('[applySuggestionAcross] No matches found in the document.');
    return;
  }
  console.log(
    `[applySuggestionAcross] Found ${ranges.length} match(es).`,
    ranges
  );

  // 2. Parse the suggestion HTML into a ProseMirror Slice
  let suggestionSlice: Slice;
  try {
    suggestionSlice = parseHtmlToSlice(suggestionHtml, schema);
    // Check if the slice is empty, which might happen with invalid HTML or just whitespace
    if (suggestionSlice.size === 0 && suggestionHtml.trim().length > 0) {
      console.warn(
        '[applySuggestionAcross] Suggestion HTML parsed into an empty slice:',
        suggestionHtml
      );
      // Optionally return here or allow replacement with empty content
      // return;
    }
  } catch (parseError) {
    console.error(
      '[applySuggestionAcross] Error parsing suggestionHtml:',
      parseError,
      suggestionHtml
    );
    return;
  }

  // 3. Build the transaction
  const tr: Transaction | null = state.tr; // Start with a transaction from the current state
  const { from: selectionFrom, to: selectionTo } = state.selection; // Remember old selection

  // Apply replacements in reverse order to maintain correct positions
  // Sort descending by start position
  ranges.sort((a, b) => b.from - a.from);

  let replaced = false;
  ranges.forEach(({ from, to }) => {
    // Ensure the range is still valid in the context of the current transaction state
    // mapPos helps adjust positions if prior replacements shifted things, though reverse order minimizes this need.
    const mappedFrom = tr!.mapping.map(from);
    const mappedTo = tr!.mapping.map(to);

    if (mappedFrom >= mappedTo) {
      console.warn(
        `[applySuggestionAcross] Skipping invalid range after mapping [${mappedFrom}, ${mappedTo}] (original [${from}, ${to}])`
      );
      return; // Skip if range becomes invalid/zero-length after mapping
    }

    console.log(
      `[applySuggestionAcross] Applying replacement at mapped range [${mappedFrom}, ${mappedTo}] (original [${from}, ${to}])`
    );

    // Replace the content within the found range with the parsed slice
    tr!.replaceRange(mappedFrom, mappedTo, suggestionSlice);
    replaced = true;
  });

  // Only proceed if actual replacements were made and transaction exists
  if (!replaced || !tr) {
    console.log(
      '[applySuggestionAcross] No valid replacements applied to the transaction.'
    );
    return;
  }

  // Add step to prevent auto-joining of blocks if necessary, depends on schema/desired behavior
  // tr.setMeta('preventUpdates', true); // Example meta key, depends on editor setup

  console.log(
    '[applySuggestionAcross] Document content modified via transaction. Dispatching.'
  );

  // 4. Dispatch the transaction and handle selection
  try {
    // Dispatch the transaction to update the editor state
    editor.view.dispatch(tr);

    // Attempt to restore selection asynchronously AFTER the state update
    setTimeout(() => {
      if (editor && !editor.isDestroyed && editor.view) {
        // Get the state *after* the transaction was applied
        const newState = editor.state;
        const currentDoc = newState.doc;

        // Use the original selection points, but cap them to the new doc size
        // Mapping the original selection through the transaction's mapping might be more accurate
        // const finalFrom = Math.min(tr.mapping.map(selectionFrom), currentDoc.content.size);
        // const finalTo = Math.min(tr.mapping.map(selectionTo), currentDoc.content.size);
        // Simpler capping approach:
        const resolvedSelectionFrom = Math.min(
          selectionFrom,
          currentDoc.content.size
        );
        const resolvedSelectionTo = Math.min(
          selectionTo,
          currentDoc.content.size
        );

        // Ensure from <= to
        const finalFrom = Math.min(resolvedSelectionFrom, resolvedSelectionTo);
        const finalTo = Math.max(resolvedSelectionFrom, resolvedSelectionTo);

        try {
          // Create a new selection based on the possibly adjusted positions
          const selection = TextSelection.create(
            currentDoc,
            finalFrom,
            finalTo
          );
          // Use a *new* transaction just for updating the selection and scrolling
          const selectionTr = newState.tr.setSelection(selection);

          // Scroll the new selection into view
          selectionTr.scrollIntoView();

          // Dispatch the selection transaction
          editor.view.dispatch(selectionTr);
          console.log(
            '[applySuggestionAcross] Selection restoration attempted.'
          );
        } catch (selectionError) {
          console.error(
            '[applySuggestionAcross] Error creating/setting selection post-update:',
            selectionError
          );
          // Attempt a fallback focus if selection fails
          editor.commands.focus('end');
        }
      }
    }, 50); // Delay might be needed for view/state reconciliation
  } catch (dispatchError) {
    console.error(
      '[applySuggestionAcross] Error dispatching replacement transaction:',
      dispatchError
    );
  }
}
