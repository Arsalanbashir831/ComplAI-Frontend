'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Issue {
  id: number;
  type: string;
  text: string;
}

interface IssueListProps {
  issues: Issue[];
  title?: string;
  showAICorrectionButton?: boolean;
  showResolveIssuesButton?: boolean;
  listClassName?: string;
}

export default function IssueList({
  issues,
  title = 'Issues',
  showAICorrectionButton = false,
  showResolveIssuesButton = false,
  listClassName = 'h-[calc(100vh-300px)]',
}: IssueListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mt-6 pb-2 border-b">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="bg-[#07378C] text-white text-xs rounded-full py-0.5 px-1.5">
            {issues.length}
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

      <ScrollArea
        className={cn('rounded-md flex-grow overflow-auto', listClassName)}
      >
        <div className="p-4">
          {issues.map((issue) => (
            <div key={issue.id} className="py-4 border-b last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-500">
                    {issue.type}
                  </p>
                  <p className="text-black mt-1">{issue.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {showResolveIssuesButton && (
        <div className="flex justify-center mt-4">
          <Button className="bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white w-52">
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
