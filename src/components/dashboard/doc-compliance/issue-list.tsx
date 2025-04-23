'use client';

import { ROUTES } from '@/constants/routes';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ComplianceResult } from '@/types/doc-compliance';

interface IssueListProps {
  results: ComplianceResult[];
  title?: string;
  showAICorrectionButton?: boolean;
  showResolveIssuesButton?: boolean;
  onResolveIssues?: () => void;
  listClassName?: string;
}

export default function IssueList({
  results,
  title = 'Issues',
  showAICorrectionButton = false,
  showResolveIssuesButton = false,
  onResolveIssues,
  listClassName = 'h-[calc(100vh-300px)]',
}: IssueListProps) {
  return (
    <div>
      {/* Header with count & optional AI Correction */}
      <div className="flex justify-between items-center mt-6 pb-2 border-b">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="bg-[#07378C] text-white text-xs rounded-full py-0.5 px-1.5">
            {results.length}
          </span>
        </div>

        {showAICorrectionButton && (
          <Link href={ROUTES.DOC_COMPLIANCE_AI_EDITOR}>
            <Button className="bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white w-52">
              <Image
                src="/icons/ai.svg"
                width={18}
                height={18}
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
        <div className="p-4 space-y-4">
          {results.map((res, idx) => (
            <div key={idx} className="space-y-2">
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
                <div>
                  {/* original text */}
                  <p className="text-black">{res.original}</p>
                </div>
              </div>

              {/* only show these if non‑compliant or suggestions exist */}
              {!res.compliant && res.reason && (
                <p className="text-sm text-gray-600">
                  <strong>Reason:</strong> {res.reason}
                </p>
              )}
              {!res.compliant && res.suggestion && (
                <p className="text-sm text-gray-600">
                  <strong>Suggestion:</strong> {res.suggestion}
                </p>
              )}

              {/* citations, if any */}
              {res.citations.length > 0 && (
                <div className="text-xs text-gray-500">
                  <strong>Citations:</strong>
                  <ul className="list-disc list-inside">
                    {res.citations.map((c, i) => (
                      <li key={i}>{String(c)}</li>
                    ))}
                  </ul>
                </div>
              )}

              <hr className="border-t" />
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Resolve button */}
      {showResolveIssuesButton && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={onResolveIssues}
            className="bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white w-52"
          >
            <Image
              src="/icons/ai.svg"
              width={18}
              height={18}
              alt="AI"
              className="mr-2"
            />
            Resolve all issues
          </Button>
        </div>
      )}
    </div>
  );
}
