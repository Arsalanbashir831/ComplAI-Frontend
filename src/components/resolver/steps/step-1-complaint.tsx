'use client';

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/constants/upload';
import { format } from 'date-fns';
import { Calendar, Folder } from 'lucide-react';

import { UploadedFile } from '@/types/upload';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  complaintDate: Date | undefined;
  setComplaintDate: (date: Date | undefined) => void;
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
  complaintDate,
  setComplaintDate,
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
      {/* Date of Complaint Section */}
      <div className="self-start mb-10 w-full max-w-[600px]">
        <div className="flex items-start gap-5 mb-5">
          <Card className="w-14 h-14 bg-primary border-none rounded-full flex items-center justify-center shrink-0">
            <Calendar className="text-white h-6 w-6" />
          </Card>
          <div className="pt-1">
            <h3 className="text-xl font-medium text-[#04338B]">
              Date of Complaint.
            </h3>
            <p className="text-[#04338B] font-normal text-base">
              Please Select the Date of Complaint.
            </p>
          </div>
        </div>

        {/* Date Picker - Aligned under text (ml = icon width 64px + gap 20px) */}
        <div className="ml-[80px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full max-w-[250px] justify-between text-left font-normal h-fit rounded text-[#04338B] border-[#79747E] text-base px-4 py-3',
                  !complaintDate && 'text-muted-foreground'
                )}
              >
                {complaintDate ? (
                  <span>{format(complaintDate, 'dd/MM/yyyy')}</span>
                ) : (
                  <span className="text-[#04338B]">DD/MM/YYYY</span>
                )}
                <Calendar className="h-6 w-6 text-[#04338B]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={complaintDate}
                onSelect={setComplaintDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Select Complaint Type Section */}
      <div className="self-start w-full max-w-[600px]">
        <div className="flex items-start gap-5 mb-6">
          <Card className="w-14 h-14 bg-primary border-none rounded-full flex items-center justify-center shrink-0">
            <Folder className="text-white h-6 w-6" />
          </Card>
          <div className="pt-1">
            <h3 className="text-xl font-medium text-[#04338B]">
              Select Your Complaint Type.
            </h3>
            <p className="text-[#04338B] font-normal text-base">
              Please select the input type for Complaint Form.
            </p>
          </div>
        </div>
        {/* Toggle aligned under text */}
        <div className="ml-[78px]">
          <ResolverInputToggle mode={mode} onModeChange={onModeChange} />
        </div>
      </div>

      {/* Input Area */}
      <div className="overflow-hidden flex flex-col w-full">
        {mode === 'documents' ? (
          <Card className="border-0 bg-white flex flex-col items-center justify-center py-6 relative rounded-[22px] shadow-[0px_0px_24px_0px_rgba(0,0,0,0.02)] flex-1 min-h-[150px]">
            <div className="w-full flex-1 flex flex-col">
              {files.length > 0 ? (
                <div className="flex-1">
                  <UploadedFiles
                    uploadedFiles={files}
                    setUploadedFiles={setFiles}
                    onUpload={handleUpload}
                    containerClassName="bg-[#F8F9FF] px-12 py-7"
                    className="text-[#04338B] text-xl font-medium"
                    filesContainerClassName="h-full"
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
          <Card className="border-0 flex-1 py-6 shadow-none">
            <Textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Enter your complaint here"
              className="w-full h-full text-lg leading-relaxed border-[#BDBDBD] rounded-lg focus-visible:ring-0 p-5 placeholder:text-gray-400 text-[#39393A] resize-none bg-transparent font-light min-h-[202px]"
            />
          </Card>
        )}
      </div>
    </>
  );
}
