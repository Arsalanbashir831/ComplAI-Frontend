import Image from 'next/image';
import React from 'react';

import { extractCitations, getFaviconUrl } from '@/lib/citations';
import type { Citation } from '@/types/chat';

// Helper function to safely extract domain from URL
const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    // Fallback: try to extract domain from url_hint string
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : 'unknown';
  }
};

export const CitationBadges: React.FC<{ citations: string | Citation }> = ({
  citations,
}) => {
  // Handle new structured format
  if (typeof citations === 'object' && citations !== null) {
    const sources = citations.sources || [];

    if (sources.length === 0) return null;

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
              />
            </svg>
            <span className="text-sm font-semibold text-blue-700">Sources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
            {sources.map((source, idx) => {
              const domain = extractDomain(source.url_hint);
              return (
                <a
                  key={source.id || idx}
                  href={source.url_hint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 border border-blue-200 rounded-full shadow-sm min-w-0 max-w-[220px] transition-colors duration-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer"
                  style={{ fontSize: '0.82rem', lineHeight: '1.1rem' }}
                >
                  <Image unoptimized
                    src={getFaviconUrl(domain)}
                    alt={`${source.title} favicon`}
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-blue-900 text-xs block truncate max-w-[100px] overflow-hidden whitespace-nowrap">
                      {source.title}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-blue-400 ml-1 flex-shrink-0 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ display: 'inline' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </span>
                    <span className="text-[10px] text-blue-600 truncate">
                      {source.publisher}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Handle old string format (for backward compatibility)
  const items = extractCitations(citations as string);
  const textRefs = items.filter((item) => item.type === 'text');
  const urlRefs = items.filter((item) => item.type === 'url');

  if (!textRefs.length && !urlRefs.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Only show references if there are no sources */}
      {textRefs.length > 0 && urlRefs.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 01-8 0M12 3v4m0 0a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4h1a4 4 0 014 4z"
              />
            </svg>
            <span className="text-base font-bold text-blue-700 tracking-wide">
              References
            </span>
          </div>
          <ul className="list-disc pl-6 space-y-2">
            {textRefs.map((item, idx) => (
              <li key={idx} className="text-base text-gray-800">
                {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources (Reference Sites) */}
      {urlRefs.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
              />
            </svg>
            <span className="text-sm font-semibold text-blue-700">Sources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
            {urlRefs.map((item, idx) => (
              <a
                key={idx}
                href={item.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 border border-blue-200 rounded-full shadow-sm min-w-0 max-w-[220px] transition-colors duration-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer"
                style={{ fontSize: '0.82rem', lineHeight: '1.1rem' }}
              >
                <Image
                  src={getFaviconUrl(item.domain!)}
                  alt={`${item.displayName} favicon`}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-blue-900 text-xs block truncate max-w-[100px] overflow-hidden whitespace-nowrap">
                    {item.displayName}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-blue-400 ml-1 flex-shrink-0 inline"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ display: 'inline' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </span>
                  <span className="text-[10px] text-blue-600 truncate">
                    {item.value}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
