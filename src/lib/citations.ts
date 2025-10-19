// Citation helpers for chat rendering
// These are used in CitationBadges and elsewhere
export function extractCitations(text: string): Array<{
  type: 'url' | 'text';
  value: string;
  domain?: string;
  displayName?: string;
}> {
  // Guard against invalid input
  if (!text || typeof text !== 'string') {
    return [];
  }

  const urlRegex = /https?:\/\/([^\s\)]+)/g;
  const citations: Array<{
    type: 'url' | 'text';
    value: string;
    domain?: string;
    displayName?: string;
  }> = [];
  let lastIndex = 0;
  let match;

  function splitReferences(plainText: string) {
    // Split on numbered points (e.g., 1. "..."), or semicolons, or newlines
    const points = plainText.match(
      /\d+\.\s*"[^"]+"|\d+\.\s*[^\d]+(?=\d+\.|$)|[^;\n]+/g
    );
    if (points) {
      points.forEach((pt) => {
        const cleaned = pt
          .trim()
          .replace(/^\d+\.\s*/, '')
          .replace(/^"|"$/g, '');
        if (cleaned) citations.push({ type: 'text', value: cleaned });
      });
    } else {
      const cleaned = plainText.trim();
      if (cleaned) citations.push({ type: 'text', value: cleaned });
    }
  }

  while ((match = urlRegex.exec(text)) !== null) {
    // Add any text before this URL as a plain text citation
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index).trim();
      if (plainText) splitReferences(plainText);
    }
    // Add the URL citation
    const fullUrl = match[0];
    const domain = match[1].split('/')[0];
    let displayName = domain.startsWith('www.') ? domain.substring(4) : domain;
    displayName = displayName.split('.')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    citations.push({ type: 'url', value: fullUrl, domain, displayName });
    lastIndex = match.index + fullUrl.length;
  }
  // Add any remaining text after the last URL
  const remaining = text.slice(lastIndex).trim();
  if (remaining) splitReferences(remaining);

  return citations;
}

export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}
// Used in CitationBadges, suppress unused warning
