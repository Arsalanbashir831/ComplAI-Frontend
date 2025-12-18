'use client';

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/constants/upload';
import { Folder } from 'lucide-react';

import { UploadedFile } from '@/types/upload';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/common/file-upload';
import UploadedFiles from '@/components/common/uploaded-files';
import {
  ResolverInputToggle,
  ResolverMode,
} from '@/components/resolver/resolver-input-toggle';

interface Step1ComplaintProps {
  mode: ResolverMode;
  onModeChange: (mode: ResolverMode) => void;
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  complaintText: string;
  setComplaintText: (text: string) => void;
}

/**
 * Step 1: Add Your Complaint
 * User can select between Documents or Text input mode.
 */
export function Step1Complaint({
  mode,
  onModeChange,
  files,
  setFiles,
  complaintText,
  setComplaintText,
}: Step1ComplaintProps) {
  const handleUpload = (newFiles: File[]) => {
    const formattedFiles: UploadedFile[] = newFiles.map((file) => {
      const uploadedFile = file as unknown as UploadedFile;
      uploadedFile.id = Math.random().toString(36).substring(7);
      uploadedFile.rawFile = file;
      uploadedFile.progress = 100;
      return uploadedFile;
    });
    setFiles((prev) => [...prev, ...formattedFiles]);
  };

  return (
    <>
      {/* Step Header */}
      <div className="self-start">
        <div className="flex items-start gap-4 mb-6">
          <Card className="w-12 h-12 bg-primary border-none rounded-full flex items-center justify-center shrink-0">
            <Folder className="text-white h-5.5 w-5.5" />
          </Card>
          <div>
            <h3 className="text-xl font-medium text-[#04338B]">
              Select Your Compliant Type
            </h3>
            <p className="text-[#04338B] font-normal">
              Please select the input type for Compliant Form.
            </p>
          </div>
        </div>
        <ResolverInputToggle mode={mode} onModeChange={onModeChange} />
      </div>

      {/* Input Area */}
      <div className="overflow-hidden flex flex-col">
        {mode === 'documents' ? (
          <Card className="border-0 bg-white flex flex-col items-center justify-center p-6 relative rounded-[22px] shadow-[0px_0px_24px_0px_rgba(0,0,0,0.02)] flex-1 min-h-[150px]">
            <div className="w-full flex-1 flex flex-col">
              {files.length > 0 ? (
                <div className="flex-1">
                  <UploadedFiles
                    uploadedFiles={files}
                    setUploadedFiles={setFiles}
                    onUpload={handleUpload}
                    containerClassName="bg-[#F8F9FF] px-12 py-7"
                    className="text-[#04338B] text-xl font-medium"
                    filesContainerClassName="h-36"
                    maxSize={MAX_FILE_SIZE}
                    allowedTypes={ALLOWED_FILE_TYPES}
                  />
                </div>
              ) : (
                <FileUpload
                  onUpload={handleUpload}
                  maxSize={MAX_FILE_SIZE}
                  allowedTypes={ALLOWED_FILE_TYPES}
                  title="Drag and drop here"
                  subtitle="File type must be (TXT, PDF and Word Doc)"
                  className="border-0 bg-[#F8F9FF] rounded-xl"
                  titleClassName="text-[#1D1E4A] text-xl font-medium"
                  subtitleClassName="text-[#73726D] text-sm font-light"
                />
              )}
            </div>
          </Card>
        ) : (
          <Card className="border-0 flex-1 min-h-[257px] mb-7 shadow-none">
            <Textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Enter your complaint here"
              className="w-full h-full text-lg leading-relaxed border-[#BDBDBD] rounded-lg focus-visible:ring-0 p-5 placeholder:text-gray-400 text-[#39393A] resize-none bg-transparent font-light"
            />
          </Card>
        )}
      </div>
    </>
  );
}
