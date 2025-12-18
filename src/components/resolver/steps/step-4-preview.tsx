'use client';

import { useState } from 'react';
import { FileText, Minus, Plus } from 'lucide-react';

import { UploadedFile } from '@/types/upload';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileCard } from '@/components/common/file-card';
import { ResolverMode } from '@/components/resolver/resolver-input-toggle';

interface Step4PreviewProps {
  mode: ResolverMode;
  complaintText: string;
  complaintFiles: UploadedFile[];
  supportingFiles: UploadedFile[];
  promptText: string;
}

interface PreviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function PreviewSection({
  title,
  icon,
  children,
  defaultExpanded = true,
}: PreviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2"
      >
        <div className="flex items-center gap-3">
          <Card className="w-10 h-10 bg-primary border-none rounded-full flex items-center justify-center shrink-0">
            {icon}
          </Card>
          <h3 className="text-lg font-medium text-[#04338B]">{title}</h3>
        </div>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          {isExpanded ? (
            <Minus className="text-white h-4 w-4" />
          ) : (
            <Plus className="text-white h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && <div className="mt-4 pl-13">{children}</div>}
    </div>
  );
}

/**
 * Step 4: Preview Your Compliant
 * Shows a summary of all entered data before generating the response.
 */
export function Step4Preview({
  mode,
  complaintText,
  complaintFiles,
  supportingFiles,
  promptText,
}: Step4PreviewProps) {
  return (
    <ScrollArea className="space-y-4 h-[55vh]">
      {/* Your Complaint Section */}
      <PreviewSection
        title="Your Complaint"
        icon={<FileText className="text-white h-5 w-5" />}
      >
        {mode === 'text' ? (
          <div className="bg-[#F8F9FF] rounded-xl p-5">
            <p className="text-primary text-base leading-relaxed italic">
              {complaintText || 'No complaint text provided.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {complaintFiles.length > 0 ? (
              complaintFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  showExtraInfo={false}
                  className="w-fit"
                  hasRemoveButton={false}
                />
              ))
            ) : (
              <p className="text-gray-400 italic">
                No complaint files uploaded.
              </p>
            )}
          </div>
        )}
      </PreviewSection>

      {/* Support Document Section */}
      <PreviewSection
        title="Support Document"
        icon={<FileText className="text-white h-5 w-5" />}
      >
        <div className="space-y-2">
          {supportingFiles.length > 0 ? (
            supportingFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                showExtraInfo={false}
                className="w-fit"
                hasRemoveButton={false}
              />
            ))
          ) : (
            <p className="text-gray-400 italic">
              No supporting documents uploaded.
            </p>
          )}
        </div>
      </PreviewSection>

      {/* Prompt Section */}
      <PreviewSection
        title="Prompt"
        icon={<FileText className="text-white h-5 w-5" />}
      >
        <div className="bg-[#F8F9FF] rounded-xl p-5">
          <p className="text-primary text-base leading-relaxed">
            {promptText || 'No prompt provided.'}
          </p>
        </div>
      </PreviewSection>
    </ScrollArea>
  );
}
