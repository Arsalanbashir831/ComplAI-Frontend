// Markdown helpers and components for chat rendering
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function normalizeTables(md: string): string {
  const lines = md.split('\n');
  let inTable = false;
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 2) {
      line = line.trim();
      if (!line.startsWith('|')) line = '|' + line;
      if (!line.endsWith('|')) line = line + '|';

      // Convert <br> tags to special delimiter ⟨BR⟩ that we'll process later
      line = line.replace(/<br\s*\/?>/gi, '⟨BR⟩');

      result.push(line);
      inTable = true;
    } else {
      if (inTable && line.trim() === '') {
        inTable = false;
      }
      result.push(line);
    }
  }
  return result.join('\n');
}

export function preserveSpaces(md: string): string {
  // Don't convert spaces in list items to &nbsp;
  // Only convert spaces in regular paragraphs (not at start of line with list markers)
  return md.replace(
    /(?<!^\s*[-*+]\s|^\s*\d+\.\s|^\s*---\s*$)( {2,})/gm,
    (match) => '&nbsp;'.repeat(match.length)
  );
}

export function preprocessMarkdown(md: string): string {
  return md.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

// Helper function to extract text content from React nodes
const extractTextContent = (node: React.ReactNode): string => {
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join('');
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props.children) {
      return extractTextContent(props.children);
    }
  }
  return '';
};

export const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mt-6 mb-3 text-2xl font-bold text-gray-900" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-5 mb-2 text-xl font-semibold text-gray-800" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold text-gray-700" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="my-3 text-base leading-relaxed text-gray-900 whitespace-pre-wrap"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="my-3 ml-6 list-disc text-base leading-relaxed text-gray-900 space-y-1"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="my-3 pl-6 !list-decimal text-base leading-relaxed text-gray-900 space-y-1"
      style={{ listStyleType: 'decimal' }}
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base leading-relaxed">
      <div className="li-wrap">{props.children}</div>
    </li>
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-blue-400 bg-blue-50 pl-4 italic my-4 text-base text-gray-700 rounded"
      {...props}
    />
  ),
  code: ({ inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline ? (
      <pre
        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner my-4"
        {...props}
      >
        <code className={match ? `language-${match[1]}` : ''}>{children}</code>
      </pre>
    ) : (
      <code
        className="bg-gray-200 text-gray-900 px-1 py-0.5 rounded font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto w-full max-w-[800px] mx-auto my-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <table
        className="w-full text-base text-left border-collapse rounded-lg"
        style={{ minWidth: 800, maxWidth: '100%', tableLayout: 'auto' }}
        {...props}
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-blue-100 sticky top-0 z-10" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="even:bg-blue-50 hover:bg-blue-100 transition-colors duration-100"
      {...props}
    />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => {
    // Extract text content and check for delimiter
    const textContent = extractTextContent(props.children);

    // Check if the text contains our delimiter
    if (textContent.includes('⟨BR⟩')) {
      const parts = textContent.split('⟨BR⟩').filter((part) => part.trim());

      if (parts.length > 1) {
        return (
          <th
            className="px-4 py-3 text-left font-bold text-blue-900 border-b border-blue-200 whitespace-normal text-base align-top"
            style={{ minWidth: 160, maxWidth: 320, wordBreak: 'break-word' }}
          >
            <ul className="list-disc pl-5 space-y-1">
              {parts.map((part, index) => (
                <li key={index} className="text-base leading-relaxed">
                  {part.trim()}
                </li>
              ))}
            </ul>
          </th>
        );
      }
    }

    return (
      <th
        className="px-4 py-3 text-left font-bold text-blue-900 border-b border-blue-200 whitespace-normal text-base align-top"
        style={{ minWidth: 160, maxWidth: 320, wordBreak: 'break-word' }}
      >
        {props.children}
      </th>
    );
  },
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => {
    // Extract text content and check for delimiter
    const textContent = extractTextContent(props.children);

    // Check if the text contains our delimiter
    if (textContent.includes('⟨BR⟩')) {
      const parts = textContent.split('⟨BR⟩').filter((part) => part.trim());

      if (parts.length > 1) {
        return (
          <td
            className="px-4 py-3 text-blue-900 border-b border-blue-100 whitespace-normal align-top"
            style={{ minWidth: 160, maxWidth: 320, wordBreak: 'break-word' }}
          >
            <ul className="list-disc pl-5 space-y-1">
              {parts.map((part, index) => (
                <li key={index} className="text-base leading-relaxed">
                  {part.trim()}
                </li>
              ))}
            </ul>
          </td>
        );
      }
    }

    return (
      <td
        className="px-4 py-3 text-blue-900 border-b border-blue-100 whitespace-normal align-top"
        style={{ minWidth: 160, maxWidth: 320, wordBreak: 'break-word' }}
      >
        {props.children}
      </td>
    );
  },
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <hr style={{ margin: '30px' }} {...props} />
  ),
  br: (props: React.HTMLAttributes<HTMLBRElement>) => <br {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre {...props} />,
};

export function MarkdownRenderer({ content }: { content: string }) {
  // Detect if content contains a table
  const containsTable = /\n?\s*\|[^\n]*\|[^\n]*\|/m.test(content);
  let processed = preprocessMarkdown(content).replace(/\\n/g, '\n'); // keep only this

  if (containsTable) {
    // For tables, don't convert <br> tags - let table cell components handle them
    processed = normalizeTables(processed);
  } else {
    // For non-table content, convert <br> tags to markdown line breaks
    processed = processed.replace(/<br\s*\/?>/gi, '  \n');
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {processed}
    </ReactMarkdown>
  );
}

export { remarkGfm };
