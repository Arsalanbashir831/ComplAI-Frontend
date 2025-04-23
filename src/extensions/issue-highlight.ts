import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface IssueHighlightOptions {
  // Array of objects, where each object has the 'original' text to highlight
  results: { original: string }[];
}

export const IssueHighlight = Extension.create<IssueHighlightOptions>({
  name: 'issueHighlight',

  addOptions() {
    return {
      results: [], // Default to empty array
    };
  },

  addProseMirrorPlugins() {
    // Capture the results array in this closure
    const resultsWithOptions = this.options.results;

    return [
      new Plugin({
        key: new PluginKey('issueHighlight'),
        props: {
          decorations(state) {
            const { doc } = state;
            const decos: Decoration[] = [];

            // Filter out results with empty/whitespace-only original strings
            const validResults = resultsWithOptions.filter(
              (r) => typeof r.original === 'string' && r.original.trim()
            );

            if (!validResults.length) {
              // No valid issues to highlight, return empty set
              return DecorationSet.empty;
            }

            // Iterate through the document using descendants - position is the start of the node
            doc.descendants((node, pos) => {
              if (!node.isText) {
                // Only interested in text nodes for matching content
                return true; // Continue descending
              }

              const nodeText = node.text;
              if (!nodeText) {
                // Skip empty text nodes
                return false; // Don't descend further within this empty node
              }

              // Check each valid result to see if it starts within this node's text
              for (const { original } of validResults) {
                const originalLength = original.length;

                // Search for the 'original' string within this specific node's text
                let index = nodeText.indexOf(original);

                while (index !== -1) {
                  // Found a potential match *starting* within this node at 'index'

                  // Calculate the start and end positions in the *document*
                  const matchStartPos = pos + index;
                  const matchEndPos = matchStartPos + originalLength;

                  // --- Verification Step ---
                  // Extract the text from the document between the calculated positions
                  // This ensures the match spans correctly across potential node boundaries
                  // if the simple indexOf was misleading (though less likely if starting in text node)
                  try {
                    const textBetween = doc.textBetween(
                      matchStartPos,
                      matchEndPos,
                      ''
                    ); // Use '' as block separator
                    if (textBetween === original) {
                      // Verified match! Create the decoration.
                      decos.push(
                        Decoration.inline(matchStartPos, matchEndPos, {
                          class: 'bg-red-200', // Apply the highlight class
                          'data-original': original, // Optional: add data attribute for debugging/interaction
                        })
                      );
                    } else {
                      // Log discrepancies for debugging if needed
                      console.warn(
                        `Mismatch: Expected "${original}", found "${textBetween}" at ${matchStartPos}-${matchEndPos}`
                      );
                    }
                  } catch (e) {
                    // Catch errors from textBetween if positions are invalid (shouldn't happen often here)
                    console.error('Error during textBetween verification:', e);
                  }

                  // Move to the next potential match within the same node
                  index = nodeText.indexOf(original, index + 1); // Start search after the current index
                }
              }

              return false; // Don't need to descend further into this text node's children (it has none)
            });

            // Create the DecorationSet from all found decorations
            // ProseMirror handles overlapping decorations reasonably well by default
            return DecorationSet.create(doc, decos);
          },
        },
      }),
    ];
  },
});
