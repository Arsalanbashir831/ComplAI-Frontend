import { SAMPLE_ISSUES } from '@/data/sample-issues';

import DashboardHeader from '@/components/dashboard/dashboard-header';
import IssueList from '@/components/dashboard/doc-compliance/issue-list';

export default function AICorrection() {
  return (
    <div className="w-full p-6 h-screen overflow-hidden flex flex-col">
      <DashboardHeader title="Document Compliance" />

      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm flex flex-col flex-grow">
        <h2 className="text-2xl font-bold">AI Compliance Report</h2>

        <IssueList issues={SAMPLE_ISSUES} showAICorrectionButton />
      </div>
    </div>
  );
}
