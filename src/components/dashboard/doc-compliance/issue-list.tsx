'use client';

import { useState } from 'react'; // Import useState
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ChevronRight } from 'lucide-react';

import { ComplianceResult } from '@/types/doc-compliance';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IssueListProps {
  results: ComplianceResult[];
  title?: string;
  showAICorrectionButton?: boolean;
  showResolveIssuesButton?: boolean;
  onResolveIssues?: () => void;
  onResolveIssue?: (idx: number) => void; // This enables the detailed view interaction
  listClassName?: string;
}

export default function IssueList({
  results,
  title = 'Issues',
  showAICorrectionButton = false,
  showResolveIssuesButton = false,
  onResolveIssues,
  onResolveIssue, // If this prop is provided, detailed view is possible
  listClassName = 'h-[calc(100vh-300px)]',
}: IssueListProps) {
  // State to track which issue index is in detailed view, null if none
  const [detailedViewIndex, setDetailedViewIndex] = useState<number | null>(
    null
  );

  const handleShowDetails = (index: number) => {
    // Only allow showing details if onResolveIssue is provided
    if (onResolveIssue) {
      setDetailedViewIndex(index);
    }
  };

  const handleApplySuggestion = (index: number) => {
    onResolveIssue?.(index);
    setDetailedViewIndex(null); // Close detailed view after applying
  };

  // const handleDismiss = () => {
  //   setDetailedViewIndex(null); // Close detailed view
  // };

  // Determine if the detailed view functionality should be enabled
  const detailedViewEnabled = !!onResolveIssue;

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Header with count & optional AI Correction */}
      <div className="flex justify-between items-center border-b">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="bg-[#07378C] text-white text-xs rounded-full py-0.5 px-1.5">
            {results.length}
          </span>
        </div>

        {showAICorrectionButton && (
          <Link href={ROUTES.DOC_COMPLIANCE_AI_EDITOR}>
            <Button className="bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white w-auto px-4 py-2 h-auto">
              <Image
                src="/icons/ai.svg" // Ensure this path is correct
                width={16}
                height={16}
                alt="AI"
                className="mr-2"
              />
              AI Correction
            </Button>
          </Link>
        )}
      </div>

      {/* Scrollable list */}
      <ScrollArea
        className={cn('rounded-md flex-grow overflow-auto', listClassName)}
      >
        <div className="py-1">
          {' '}
          {/* Reduced padding for denser list look */}
          {results.map((res, idx) => (
            <div
              key={idx}
              className={cn(
                'border-b last:border-b-0',
                // Add slight background change on hover if detailed view is enabled
                detailedViewEnabled &&
                  !res.compliant &&
                  'hover:bg-gray-50 cursor-pointer',
                detailedViewIndex === idx ? 'bg-gray-50 p-4' : 'p-3' // Add padding when detailed
              )}
              // Only make clickable if detailed view is enabled and not compliant
              onClick={
                detailedViewEnabled &&
                !res.compliant &&
                detailedViewIndex !== idx
                  ? () => handleShowDetails(idx)
                  : undefined
              }
            >
              {/* Conditional Rendering: Detailed View vs Standard View */}
              {detailedViewEnabled && detailedViewIndex === idx ? (
                // --- Detailed View (like the image) ---
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Compliance Dot */}
                    <div className="mt-1 flex-shrink-0">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          !res.compliant ? 'bg-red-500' : 'bg-green-500' // Should always be red in detailed view? Assuming non-compliant issues show details.
                        )}
                      ></div>
                    </div>
                    {/* Issue Title and Original Text */}
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {res.reason || 'Compliance Issue'}
                      </p>{' '}
                      {/* Use reason as title */}
                      <p className="text-xs text-gray-600 mt-1 italic">
                        &rdquo;{res.original}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Issue Details (Optional - could be part of reason) */}
                  {/* You might want a separate field for 'details' if 'reason' is just a title */}
                  {/* <div className="pl-6 flex items-center gap-2 text-sm text-gray-700">
                      <Info size={16} className="text-gray-500" />
                      <span>Consider changing passive voice...</span>  Example Detail
                  </div> */}

                  {/* Suggestion */}
                  {res.suggestion && (
                    <div className="pl-6 space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        Suggestion:
                      </p>
                      <div className="text-sm text-gray-800 bg-white border border-gray-200 rounded p-2">
                        {res.suggestion}
                      </div>
                    </div>
                  )}

                  {/* Citations */}
                  {res.citations && res.citations.length > 0 && (
                    <div className="pl-6 text-xs text-gray-500">
                      <strong>Citations:</strong>
                      <ul className="list-disc list-inside">
                        {res.citations.map((c, i) => (
                          <li key={i}>{String(c)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-start gap-3 pl-6 pt-2">
                    <Button
                      onClick={() => handleApplySuggestion(idx)}
                      size="sm"
                      className="bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white px-4 w-full"
                    >
                      Apply Suggestion
                    </Button>
                    {/* <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:bg-gray-200 px-4"
                    >
                      Dismiss
                    </Button> */}
                  </div>
                </div>
              ) : (
                // --- Standard View (Original compact layout) ---
                <div className="flex items-start gap-3">
                  {/* compliance dot */}
                  <div className="mt-1 flex-shrink-0">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        !res.compliant ? 'bg-red-500' : 'bg-green-500'
                      )}
                    ></div>
                  </div>
                  {/* Issue Summary */}
                  <div className="flex-grow">
                    {/* Show Reason/Title first if available and non-compliant */}
                    {!res.compliant && res.reason && (
                      <p className="text-sm font-medium text-gray-700 line-clamp-2">
                        {res.reason}
                      </p>
                    )}
                    {/* Original text */}
                    <p
                      className={cn(
                        'text-sm line-clamp-2',
                        res.compliant ? 'text-gray-700' : 'text-black',
                        !res.compliant && res.reason ? 'mt-0.5' : ''
                      )}
                    >
                      {res.original}
                    </p>

                    {/* Show suggestion inline only if no reason was shown above it */}
                    {!res.compliant && !res.reason && res.suggestion && (
                      <p className="text-xs text-gray-500 mt-1">
                        Suggestion: {res.suggestion}
                      </p>
                    )}

                    {/* Citations (optional in compact view) */}
                    {/* {res.citations.length > 0 && ( ... )} */}
                  </div>
                  {/* Optional: Add an icon/button to trigger detailed view if needed */}
                  {detailedViewEnabled && !res.compliant && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowDetails(idx);
                      }}
                      title="View details and resolve"
                      className="text-gray-400 hover:text-blue-600 p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {/* Example using an icon, replace with your preferred icon */}
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Resolve All Issues button */}
      {showResolveIssuesButton && (
        <div className="mt-4 w-full">
          <Button
            onClick={onResolveIssues}
            className="bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white w-full px-6 py-2.5 flex items-center justify-center"
            disabled={results.length === 0}
          >
            <Image
              src="/icons/ai.svg"
              width={18}
              height={18}
              alt=""
              className="mr-2"
            />
            Resolve All Issues
          </Button>
        </div>
      )}
    </div>
  );
}
