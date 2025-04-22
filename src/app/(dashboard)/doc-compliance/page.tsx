'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import animationData from '@/assets/lottie/ai-review-animation.json';
// import { API_ROUTES } from '@/constants/apiRoutes';
import { useDocComplianceStore } from '@/store/use-doc-compliance-store';
import { X } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
// import apiCaller from '@/config/apiCaller';
import LottiePlayer from '@/components/common/lottie-animation';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import IssueList from '@/components/dashboard/doc-compliance/issue-list';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: string;
  file: File;
}

export default function DocCompliancePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // ← new state for the API results
  const { results, setResults } = useDocComplianceStore();

  const handleUpload = (files: File[]) => {
    setIsUploading(true);
    setTimeout(() => {
      const newFiles = files.map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: Math.round(file.size / 1024),
        type: file.type,
        status: 'uploaded',
        file,
      }));
      setUploadedFiles(newFiles);
      setIsUploading(false);
    }, 1500);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleUpload(files);
    }
  };

  const handleAIReview = async () => {
    if (!uploadedFiles.length) return;
    setIsReviewing(true);

    const file = uploadedFiles[0].file;
    let fileText = '';

    try {
      // 1) Read plain .txt
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        fileText = await file.text();
      }
      // 2) PDF
      else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let txt = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          txt += content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
        }
        fileText = txt;
      }
      // 3) DOCX
      else if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        fileText = result.value;
      } else {
        // fallback for anything else
        fileText = await file.text();
      }

      // const response = await apiCaller(
      //   API_ROUTES.DOC_COMPLIANCE.CHECK_DOC,
      //   'POST',
      //   { document: file },
      //   {},
      //   true,
      //   'formdata'
      // );

      // 5) Save both AI results & raw text into Zustand
      // setResults(response.data.results, fileText);
      setResults(
        [
          {
            original: 'Client Care Policy Effective Date: 14 October 2018 1.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },

          {
            original:
              'This can be done simply by the practice being seen to do its best to help them.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'Delays at reception If there is a delay of over 10 minutes the receptionist should endeavour to: offer an apology to the client; phone the member of staff and request an update to inform the client; inform the client of the reasons for the delay and actions to remedy; escort the client to the relevant meeting room, if appropriate; provide the client with suitable refreshments.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              "If there is a delay of over 20 minutes the receptionist should: offer an apology to the client; phone the member of staff and advise that they, a member of their team or secretary are required to deal with the situation; suggest a different appointment time, or organise the fee-earner's secretary to do so, if directed to by a colleague.",
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              '5.5 Dress and demeanour Dress It is important that the practice should project a sense of professionalism at all times, particularly in its dealings with clients.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original: 'First impressions gained by clients do matter.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'Everybody should dress in a manner which is appropriate for their practice and a respectful manner.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              "Conduct Professionals should also try to conduct themselves in a way that will reassure clients and enhance the practice's commitment to client service.",
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'This can be achieved by appropriate behaviour both in and outside the office towards clients, business contacts, suppliers and other third parties.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'A positive, respectful and professional approach will have a significant impact on any client.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              "5.6 Client feedback Feedback A client's experience can have a significant impact on a practice.",
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'It could result in repeat business or a positive referral to a prospective client.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'To help Newport Land & Law continually improve its service, feedback from clients is actively encouraged and valued.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'There are various methods to elicit feedback, including client satisfaction surveys and post-matter questionnaires.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'Which method is used will depend on what is most appropriate for the practice or the client.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'Complaints The practice also monitors and evaluates client complaints to identify and address shortcomings and failings in its standard of service.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'Such feedback is essential to help continually gauge client perceptions of the practice.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'Review Feedback will be regularly reviewed and escalated to management level.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              "5.7 Confirmation of instructions Confirmation of instruction At or near the outset of every matter the client should receive: confirmation of the name and status of the person acting, along with details of the principal person responsible for the overall supervision of the matter (contained in the practice's initial opening letter for conveyancing, which should always be sent);  a written estimate of costs and disbursements in the practice's standard form; a copy of the terms and conditions of business under which the practice acts; advice as to how to complain and of their right to complain to the Legal Ombudsman, the timeframe for doing so and full details of how to contact the Legal Ombudsman.",
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original: '6.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original: 'Responsibilities 6.1.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              "All staff that interact with clients Must take responsibility to: make a reservation as soon as possible when meeting rooms are required; ensure that all visitors are greeted appropriately and met from reception and shown back to reception; ensure that clients are not kept waiting; clients are escorted to the relevant meeting room, if appropriate; clients are provided with suitable refreshments; the reception area and any rooms used for client meetings are kept clean and tidy and appropriate; the practice's publicity material is made available to clients and is kept in presentable condition; any colleagues discussing inappropriate topics, e.g.",
            compliant: false,
            suggestion:
              "All staff that interact with clients must take responsibility to: make a reservation as soon as possible when meeting rooms are required; ensure that all visitors are greeted appropriately and met from reception and shown back to reception; ensure that clients are not kept waiting; clients are escorted to the relevant meeting room, if appropriate; clients are provided with suitable refreshments; the reception area and any rooms used for client meetings are kept clean and tidy and appropriate; the practice's publicity material is made available to clients and is kept in presentable condition; address any colleagues discussing inappropriate topics, e.g.",
            reason:
              'The sentence is non-compliant due to the lack of a verb in the last clause, making it incomplete and unclear.',
            citations: [
              'https://www.sra.org.uk/solicitors/standards-regulations/code-conduct-solicitors/',
            ],
          },
          {
            original: 'a client matter, are advised to vacate the reception.',
            compliant: false,
            suggestion:
              'Due to a client matter, you are advised to vacate the reception.',
            reason:
              'The sentence is incomplete and lacks clarity, which may lead to misunderstandings.',
            citations: [],
          },
          {
            original: '7.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
          {
            original:
              'Enforcement If a person was found to be in violation of this policy, they would be dealt with in line with disciplinary policy and procedure.',
            compliant: true,
            suggestion: '',
            reason: '',
            citations: [],
          },
        ],
        fileText
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.message ||
          err.response?.data?.message ||
          'Something went wrong reviewing your document.'
      );
    } finally {
      setIsReviewing(false);
    }
  };

  if (isReviewing) {
    return (
      <div className="w-full p-6  h-screen bg-white border">
        <DashboardHeader title="Document Compliance" />

        <div className="w-full flex flex-col items-center justify-center  mt-12">
          <LottiePlayer
            animationData={animationData}
            style={{ height: '400px', width: '400px' }}
          />
          <p className="text-lg text-gray-600">
            AI is reviewing your document...
          </p>
        </div>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className="w-full p-6 h-screen overflow-hidden flex flex-col">
        <DashboardHeader title="Document Compliance" />

        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm flex flex-col flex-grow">
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm flex flex-col flex-grow">
            <h2 className="text-2xl font-bold">AI Compliance Report</h2>

            <IssueList results={results} showAICorrectionButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-5 ">
      <DashboardHeader title="Document Compliance" />

      <div className="mt-1 w-full bg-[#0A58EB] text-white py-4 px-14  rounded-xl">
        <h2 className="text-3xl font-bold mb-1">AI-Powered Doc Compliance</h2>
        <p className="text-md opacity-90">
          Compliance AI uses advanced artificial intelligence to instantly scan
          your legal, business, policy documents or others for compliance gaps,
          risky language, and missing clauses.
        </p>
      </div>

      <div className="mt-4 bg-white p-6 rounded-xl shadow-sm ">
        <div className="flex items-start gap-4">
          <div className="bg-[#1D1E4A] p-3 rounded-3xl">
            <Image
              src="/icons/plain-document.svg"
              width={38}
              height={38}
              alt="Document"
            />
          </div>
          <div>
            <h3 className="text-xl ">Upload Your Documents</h3>
            <p className="text-gray-600">
              Easily scan and manage compliance issues with just a few clicks!
            </p>
          </div>
        </div>

        {uploadedFiles.length > 0 ? (
          <div className="flex flex-col justify-center items-center py-10">
            <div className="mt-6 w-1/2 bg-[#EBECFF] rounded-xl p-6">
              <h4 className="text-lg font-medium mb-4">Uploaded File(s)</h4>

              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-[#07378C] text-white p-3 rounded-lg mb-3"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/icons/word-document.svg"
                      width={24}
                      height={24}
                      alt={file.name}
                    />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm opacity-80">
                        {file.size} KB {isUploading ? 'Uploading...' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-white hover:bg-blue-700 rounded-full p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 w-1/2">
              <Button
                onClick={handleAIReview}
                className="w-full bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white"
              >
                <Image
                  src="/icons/ai.svg"
                  width={18}
                  height={18}
                  alt="AI"
                  className="mr-2"
                />
                AI Review
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-10">
            <div
              className="mt-6 w-1/2 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer bg-[#F8F9FF]"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="mb-4">
                <Image
                  src="/icons/file-upload.svg"
                  width={60}
                  height={60}
                  alt="Upload"
                />
              </div>
              <h4 className="text-lg font-medium mb-2">Drag and drop here</h4>
              <p className="text-gray-500 text-sm">
                File type must be (TXT, PDF and Word Doc)
              </p>

              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
                multiple
                onChange={handleFileInputChange}
              />
            </div>
          </div>
        )}

        {/* {uploadedFiles.length > 0 && (
        <div className="mt-4 w-1/2 mx-auto">
          <Button
            onClick={handleAIReview}
            className="w-full bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white"
            disabled={isUploading}
          >
            <Image
              src="/icons/ai.svg"
              width={18}
              height={18}
              alt="AI"
              className="mr-2"
            />
            AI Review
          </Button>
        </div>
      )} */}
      </div>
    </div>
  );
}
