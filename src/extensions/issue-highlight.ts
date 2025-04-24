import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface IssueHighlightOptions {
  /** Array of issues with the 'original' text (HTML or plain) and a 'resolved' flag */
  results: { original: string; resolved?: boolean }[];
}

// Utility to strip HTML tags to plain text
function stripHTML(html: string): string {
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  return html.replace(/<[^>]+>/g, '');
}

// Utility to escape regex special chars
function escapeRx(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export const IssueHighlight = Extension.create<IssueHighlightOptions>({
  name: 'issueHighlight',

  addOptions() {
    return { results: [] };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('issueHighlight');

    return [
      new Plugin({
        key: pluginKey,
        props: {
          decorations: (state) => {
            const { doc } = state;
            const issues = this.options.results.filter((i) => !i.resolved);
            if (!issues.length) return DecorationSet.create(doc, []);

            const fullText = doc.textBetween(0, doc.content.size, '\n');
            const decos: Decoration[] = [];

            for (const { original } of issues) {
              const plain = stripHTML(original).trim();
              if (!plain) continue;

              // split into words and allow any whitespace between them
              const words = plain.split(/\s+/).map(escapeRx);
              const pattern = words.join('\\s+');
              const regex = new RegExp(pattern, 'gi');
              let match;

              while ((match = regex.exec(fullText)) !== null) {
                const start = match.index;
                const end = start + match[0].length;
                decos.push(
                  Decoration.inline(start, end, {
                    class: 'bg-red-200',
                  })
                );
              }
            }

            return DecorationSet.create(doc, decos);
          },
        },
      }),
    ];
  },
});
