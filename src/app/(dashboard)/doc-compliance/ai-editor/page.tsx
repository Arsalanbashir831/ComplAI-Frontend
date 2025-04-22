import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Editor } from '@/components/dashboard/doc-compliance/editor/editor';
import { ToolBar } from '@/components/dashboard/doc-compliance/editor/toolbar';

// interface DocumentIdPageProps {
//   params: Promise<{ documentId: string }>;
// }

const DocumentIdPage = async () =>
  // { params }: DocumentIdPageProps
  {
    // const { documentId } = await params;
    return (
      <div className="min-h-screen">
        <div className="flex flex-col px-4 pt-2 gap-y-2 z-10 bg-[#FAFBFD] print:hidden">
          <DashboardHeader title="Document Compliance" />
          {/* <Navbar /> */}
          <ToolBar />
        </div>
        <div className="pt-2 print:pt-0">
          <Editor />
        </div>
      </div>
    );
  };

export default DocumentIdPage;
