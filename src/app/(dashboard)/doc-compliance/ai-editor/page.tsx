import { SAMPLE_ISSUES } from '@/data/sample-issues';

import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Editor } from '@/components/dashboard/doc-compliance/editor/editor';
import { ToolBar } from '@/components/dashboard/doc-compliance/editor/toolbar';
import IssueList from '@/components/dashboard/doc-compliance/issue-list';

// interface DocumentIdPageProps {
//   params: Promise<{ documentId: string }>;
// }

const DocumentIdPage = async () =>
  // { params }: DocumentIdPageProps
  {
    // const { documentId } = await params;
    return (
      <div className="h-screen overflow-hidden flex flex-col">
        {/* Header and Toolbar */}
        <div className="px-4 pt-2 z-10 bg-[#FAFBFD] print:hidden space-y-4">
          <DashboardHeader title="Document Compliance" />
          <ToolBar />
        </div>

        {/* Editor + Issue List - Scrollable content area */}
        <div className="flex flex-1 overflow-hidden mt-2 px-4 gap-x-4 print:hidden">
          {/* Editor */}
          <ScrollArea className="flex-1 w-full">
            <Editor />
          </ScrollArea>

          {/* Issue List */}
          <div className="w-full max-w-[300px] flex-shrink-0">
            <IssueList
              issues={SAMPLE_ISSUES}
              listClassName="h-[calc(100vh-280px)]"
              showResolveIssuesButton
            />
          </div>
        </div>
      </div>
    );
  };

export default DocumentIdPage;
