// src/lib/highlighter.ts (Contains addMarksToHtmlContentWordByWord and getNextToken)

import { ComplianceResult } from '@/types/doc-compliance';

interface HtmlToken {
  text: string;
  type: 'word' | 'tag' | 'whitespace' | 'other';
  startIndex: number;
  endIndex: number;
}

function getNextToken(html: string, startIndex: number): HtmlToken | null {
  // ... (Implementation from the previous answer) ...
  if (startIndex >= html.length) {
    return null;
  }
  const firstChar = html[startIndex];
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
      return {
        text: firstChar,
        type: 'other',
        startIndex: startIndex,
        endIndex: startIndex + 1,
      };
    }
  }
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
  return {
    text: firstChar,
    type: 'other',
    startIndex: startIndex,
    endIndex: startIndex + 1,
  };
}

export function addMarksToHtmlContentWordByWord(
  htmlContent: string,
  results: ComplianceResult[]
): string {
  // ... (Implementation from the previous answer - make sure it uses getNextToken) ...
  if (!htmlContent || !results || results.length === 0) {
    return htmlContent;
  }
  const resultsToHighlight = results.filter(
    (r): r is ComplianceResult & { original: string } =>
      !r.compliant &&
      typeof r.original === 'string' &&
      r.original.trim().length > 0
  );
  if (resultsToHighlight.length === 0) {
    return htmlContent;
  }
  let processedHtml = htmlContent;
  resultsToHighlight.forEach((result) => {
    const targetWords = result.original.trim().split(/\s+/).filter(Boolean);
    if (targetWords.length === 0) return;
    const currentHtml = processedHtml;
    let newHtml = '';
    let i = 0;
    let targetWordIndex = 0;
    let potentialMatchTokens: HtmlToken[] = [];
    let inPotentialMatch = false;
    while (i < currentHtml.length) {
      const token = getNextToken(currentHtml, i);
      if (!token) break;
      let processedToken = false;
      if (inPotentialMatch) {
        if (token.type === 'word') {
          if (
            targetWordIndex < targetWords.length &&
            token.text.toLowerCase() ===
              targetWords[targetWordIndex].toLowerCase()
          ) {
            potentialMatchTokens.push(token);
            targetWordIndex++;
            if (targetWordIndex === targetWords.length) {
              newHtml += '<mark style="background-color: #ff000077;">'; // Using red background as requested implicitly by previous examples
              potentialMatchTokens.forEach((t) => (newHtml += t.text));
              newHtml += '</mark>';
              inPotentialMatch = false;
              potentialMatchTokens = [];
              targetWordIndex = 0;
              processedToken = true;
            }
          } else {
            potentialMatchTokens.forEach((t) => (newHtml += t.text));
            inPotentialMatch = false;
            potentialMatchTokens = [];
            targetWordIndex = 0;
          }
        } else if (token.type === 'tag' || token.type === 'whitespace') {
          potentialMatchTokens.push(token);
          processedToken = true;
        } else {
          potentialMatchTokens.forEach((t) => (newHtml += t.text));
          inPotentialMatch = false;
          potentialMatchTokens = [];
          targetWordIndex = 0;
        }
      }
      if (!inPotentialMatch && !processedToken) {
        if (
          token.type === 'word' &&
          targetWords.length > 0 &&
          token.text.toLowerCase() === targetWords[0].toLowerCase()
        ) {
          inPotentialMatch = true;
          potentialMatchTokens = [token];
          targetWordIndex = 1;
          if (targetWordIndex === targetWords.length) {
            newHtml += '<mark style="background-color: #ff000077;">';
            newHtml += token.text;
            newHtml += '</mark>';
            inPotentialMatch = false;
            potentialMatchTokens = [];
            targetWordIndex = 0;
          }
        } else {
          newHtml += token.text;
        }
      }
      i = token.endIndex;
    }
    if (inPotentialMatch) {
      potentialMatchTokens.forEach((t) => (newHtml += t.text));
    }
    processedHtml = newHtml;
  });
  return processedHtml;
}
