'use client';

import { CircleArrowRight, Folder } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

import UploadedFiles from '@/components/common/uploaded-files';
import {
  ResolverInputToggle,
  ResolverMode,
} from '@/components/resolver/resolver-input-toggle';
import { ResolverStepper } from '@/components/resolver/resolver-stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/types/upload';

export default function ResolverPage() {
  const [mode, setMode] = useState<ResolverMode>('documents');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [complaintText, setComplaintText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];
    const filteredFiles = newFiles.filter((file) => {
      const fileName = file.name.toLowerCase();
      return allowedExtensions.some((ext) => fileName.endsWith(ext));
    });

    const formattedFiles: UploadedFile[] = filteredFiles.map((file) => {
      const uploadedFile = file as unknown as UploadedFile;
      uploadedFile.id = Math.random().toString(36).substring(7);
      uploadedFile.rawFile = file;
      uploadedFile.progress = 100;
      return uploadedFile;
    });

    setFiles((prev) => [...prev, ...formattedFiles]);
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-poppins">
      {/* Center Column: Interactive Content */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full pt-20 pb-12 px-8 flex flex-col">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl font-medium text-[#04338B] mb-4">
              AI Powered Compliant Resolver
            </h1>
            <p className="text-[#626262]">
              Paste the complaint and add any context .<br />
              Resolve will help you generate a swift, compliant, and thoughtful
              response.
            </p>
          </div>

          {/* Type Selection Section */}
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
            <ResolverInputToggle mode={mode} onModeChange={setMode} />
          </div>

          {/* Input Area */}
          <div className="overflow-hidden flex flex-col">
            {mode === 'documents' ? (
              <Card className="border-0 bg-white flex flex-col items-center justify-center p-6 relative rounded-[22px] shadow-[0px_0px_24px_0px_rgba(0,0,0,0.02)] flex-1 min-h-[150px]">
                <div className="w-full flex-1 flex flex-col">
                  {/* Conditional Rendering: Show UploadedFiles if files exist, else show Drop Zone */}
                  {files.length > 0 ? (
                    <div className="flex-1">
                      <UploadedFiles
                        uploadedFiles={files}
                        setUploadedFiles={setFiles}
                        onUpload={addFiles}
                        containerClassName="bg-[#F8F9FF] px-12 py-7"
                        className="text-[#04338B] text-xl font-medium"
                        filesContainerClassName="h-36"
                        maxSize={5 * 1024 * 1024}
                        allowedTypes={[
                          'text/plain',
                          'application/pdf',
                          'application/msword',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        ]}
                      />
                    </div>
                  ) : (
                    /* Drop Zone (Figma Node 6:2999) */
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'bg-[#F8F9FF] border-2 border-dashed rounded-[15px] flex flex-col items-center justify-center cursor-pointer transition-all flex-1 min-h-[15px] px-12 py-8',
                        isDragging
                          ? 'border-primary bg-blue-50/50'
                          : 'border-[#E5E7EB] hover:border-primary/30'
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept=".txt,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain"
                        onChange={(e) =>
                          addFiles(Array.from(e.target.files || []))
                        }
                      />

                      {/* Upload Icon (Figma Node 6:3000) */}
                      <div className="w-[80px] h-[80px] mb-6 flex items-center justify-center">
                        <Image
                          src="/icons/file-upload.svg"
                          alt="Upload"
                          width={80}
                          height={80}
                          className="opacity-90"
                        />
                      </div>

                      <div className="text-center space-y-2">
                        <p className="font-poppins font-medium text-[22px] text-[#1D1E4A]">
                          Drag and drop here
                        </p>
                        <p className="font-poppins font-light text-[17px] text-[#73726D]">
                          File type must be (TXT, PDF and Word Doc)
                        </p>
                      </div>
                    </div>
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

          {/* Action Button */}
          <div className="flex justify-end pt-1">
            <Button className="h-14 px-10 rounded-lg text-base font-semibold flex gap-3 items-center [&_svg]:!size-7">
              <span>Next Step</span>
              <CircleArrowRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Stepper Panel */}
      <div className="w-[470px] shrink-0 flex flex-col items-end">
        <ResolverStepper currentStep={1} />
      </div>
    </div>
  );
}
