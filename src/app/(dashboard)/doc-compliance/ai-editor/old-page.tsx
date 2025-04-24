'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDocComplianceStore } from '@/store/use-doc-compliance-store';
import { useEditorStore } from '@/store/use-editor-store';

import { addMarksToHtmlContent, applySuggestionAcross } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Editor } from '@/components/dashboard/doc-compliance/editor/editor';
import { ToolBar } from '@/components/dashboard/doc-compliance/editor/toolbar';
import IssueList from '@/components/dashboard/doc-compliance/issue-list';

export default function DocumentIdPage() {
  const router = useRouter();
  const { results, content = '' } = useDocComplianceStore();
  const { editor } = useEditorStore();

  console.log('DocumentIdPage', { results, content });

  // Pre-process content to add initial marks
  // Use useMemo to avoid recalculating on every render unless content/results change
  const initialContentWithMarks = useMemo(() => {
    console.log('Calculating initial content with marks...');
    return addMarksToHtmlContent(content, results);
  }, [content, results]);
  console.log('Initial content with marks:', initialContentWithMarks);

  // If we don’t have any content (e.g. user hit refresh), bounce back
  useEffect(() => {
    if (!content) router.push('/doc-compliance');
  }, [content, router]);

  const handleResolveAll = () => {
    if (!editor) return;
    results.forEach(({ original, suggestion }) => {
      if (suggestion) applySuggestionAcross(editor, original, suggestion);
    });
  };

  const handleResolveIssue = (idx: number) => {
    if (!editor) return;
    const { original, suggestion } = results[idx];
    if (editor && suggestion)
      applySuggestionAcross(editor, original, suggestion);
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
          <ScrollArea className="flex-1 w-full bg-white rounded-lg p-4 h-[calc(100vh-130px)]">
            <Editor
              key={JSON.stringify(results.map((r) => r.original))}
              initialContent={initialContentWithMarks}
              results={results}
            />
          </ScrollArea>
        </div>

        {/* Right: issues + “Resolve all” */}
        <div className="w-full max-w-[300px] flex-shrink-0">
          <IssueList
            results={results}
            listClassName="h-[calc(100vh-280px)]"
            showResolveIssuesButton
            onResolveIssues={handleResolveAll}
            onResolveIssue={handleResolveIssue}
          />
        </div>
      </div>
    </div>
  );
}
