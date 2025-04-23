'use client';

import { useDocComplianceStore } from '@/store/use-doc-compliance-store';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Editor } from '@/components/dashboard/doc-compliance/editor/editor';
import { ToolBar } from '@/components/dashboard/doc-compliance/editor/toolbar';
import IssueList from '@/components/dashboard/doc-compliance/issue-list';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DocumentIdPage() {
  const router = useRouter();
  const { results, content = '', setContent } = useDocComplianceStore();

  // If we don’t have any content (e.g. user hit refresh), bounce back
  useEffect(() => {
    if (!content) router.push('/doc-compliance');
  }, [content, router]);

  // 1) Inject <mark> around each flagged span
  const highlighted = useMemo(() => {
    let html = content;

    for (const { original } of results) {
      if (typeof original !== 'string' || !original.trim()) continue;

      const esc = original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      html = html.replace(
        new RegExp(esc, 'g'),
        `<mark class="bg-red-200">${original}</mark>`
      );
    }

    return html;
  }, [content, results]);

  // 2) Bulk‐apply all suggestions
  const handleResolveAll = () => {
    let updated = content;
    for (const { original, suggestion } of results) {
      if (!suggestion) continue;
      const esc = original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      updated = updated.replace(new RegExp(esc, 'g'), suggestion);
    }
    setContent(updated);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header + Toolbar */}
      <div className="px-4 pt-2 bg-[#FAFBFD] space-y-4 print:hidden z-10">
        <DashboardHeader title="Document Compliance" />
        <ToolBar />
      </div>

      <div className="flex flex-1 mt-2 px-4 gap-x-4 overflow-hidden print:hidden">
        {/* Left: full‐width TipTap editor with highlights */}
        <div className="flex-1">
          <ScrollArea className="flex-1 w-full bg-white rounded-lg p-4">
            <Editor initialContent={highlighted} />
          </ScrollArea>
        </div>

        {/* Right: issues + “Resolve all” */}
        <div className="w-full max-w-[300px] flex-shrink-0">
          <IssueList
            results={results}
            listClassName="h-[calc(100vh-280px)]"
            showResolveIssuesButton
            onResolveIssues={handleResolveAll}
          />
        </div>
      </div>
    </div>
  );
}
