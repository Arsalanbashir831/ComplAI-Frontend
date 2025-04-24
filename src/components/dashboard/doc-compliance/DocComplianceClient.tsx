'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import animationData from '@/assets/lottie/ai-review-animation.json';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useDocComplianceStore } from '@/store/use-doc-compliance-store';
import { X } from 'lucide-react';
import mammoth from 'mammoth';
// import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';

import apiCaller from '@/config/apiCaller';
import { Button } from '@/components/ui/button';
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
  interface ComplianceResult {
    original: string;
    compliant: boolean;
    suggestion: string;
    reason: string;
    citations: string[];
  }
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
    console.log(uploadedFiles[0].file);
    if (!uploadedFiles.length) return;
    setIsReviewing(true);

    const file = uploadedFiles[0].file;
    let fileText = '';

    try {
      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        console.log('going there');
        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        fileText = html;
      } else if (
        file.type === 'application/msword' ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        toast.error(
          'Old “.doc” files aren’t supported—please save as .docx and try again.'
        );
        setIsReviewing(false);
        return;
      } else {
        // fallback for anything else
        fileText = await file.text();
      }

      const response = await apiCaller(
        API_ROUTES.DOC_COMPLIANCE.CHECK_DOC,
        'POST',
        { document: uploadedFiles[0].file },
        {},
        true,
        'formdata'
      );

      const allResults = response.data.results as ComplianceResult[];
      // const allResults = [
      //   {
      //     original: "Client Care Policy Gerry's Solicitors Ltd. 1.",
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Introduction At Gerry’s Solicitors Ltd., we are committed to delivering the highest standards of legal services to our clients.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'This Client Care Policy outlines our commitment to professionalism, transparency, and client satisfaction.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'It ensures compliance with the Solicitors Regulation Authority (SRA) Standards and Regulations and provides clear information about our services, responsibilities, and your rights as a client.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '2.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Our Responsibilities We are committed to: Providing clear, accurate, and practical legal advice.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: 'Acting in your best interests at all times.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: 'Keeping you informed about the progress of your matter.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: 'Explaining legal costs transparently and in advance.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: 'Responding promptly to your enquiries.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: 'Maintaining strict confidentiality in all matters.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Handling your money in accordance with the SRA Accounts Rules.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Complying with all anti-money laundering (AML) and data protection regulations.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '3.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       '[Insert your practice areas, e.g., Family Law, Conveyancing, Employment Law, Commercial Law, etc.]',
      //     compliant: false,
      //     suggestion:
      //       'Family Law, Conveyancing, Employment Law, Commercial Law.',
      //     reason:
      //       'The sentence contains placeholder text that should be replaced with specific practice areas to provide clear and accurate information to clients.',
      //     citations: [
      //       'https://www.sra.org.uk/solicitors/standards-regulations/code-conduct-solicitors/',
      //     ],
      //   },
      //   {
      //     original:
      //       'If we are unable to assist you, we will provide appropriate referrals to alternative legal service providers.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '4.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Communication & Availability We are committed to effective communication and will: Provide a dedicated point of contact for your case.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Aim to respond to emails and calls within two working days.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Offer meetings in person, by telephone, or via video conferencing as needed.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '5.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Fees & Billing Transparency Our fees will be clearly outlined in our Client Care Letter before we commence work.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Any changes to fees will be communicated in writing and require your consent.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'We may request payments on account for disbursements and legal fees.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'All invoices will include a breakdown of costs and payment methods.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '6.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Confidentiality & Data Protection We will protect all personal and confidential information in compliance with the UK GDPR and the Data Protection Act 2018.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Your information will not be shared without your consent, except where required by law.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: 'Further details can be found in our Privacy Policy.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '7.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Anti-Money Laundering (AML) Compliance We are required to verify your identity in accordance with the Money Laundering Regulations 2017.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: 'We may request proof of funds for transactions.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'If we suspect any illegal activity, we are legally obligated to report it.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '8.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Conflict of Interest We will not act where there is a conflict of interest unless we obtain informed consent from all affected parties.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'If a conflict arises during our engagement, we will notify you immediately and take appropriate steps to resolve the issue.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '9.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Client Complaints Procedure We aim to provide excellent service, but if you are dissatisfied: Please raise your concern with your solicitor in the first instance.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'If unresolved, contact our Complaints Officer at [complaints@gerrysolicitors.co.uk] or by phone at [insert phone number].',
      //     compliant: false,
      //     suggestion:
      //       'If unresolved, contact our Complaints Officer at [complaints@gerrysolicitors.co.uk] or by phone at [insert phone number].',
      //     reason:
      //       'The sentence is incomplete and does not provide a complete method of contact, which may be misleading or unhelpful to clients.',
      //     citations: [
      //       'https://www.sra.org.uk/solicitors/standards-regulations/code-conduct-solicitors/',
      //     ],
      //   },
      //   {
      //     original:
      //       'We will acknowledge complaints within five working days and provide a full response within eight weeks.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'If you remain dissatisfied, you may refer the matter to the Legal Ombudsman at: Website: www.legalombudsman.org.uk Phone: 0300 555 0333 Email: enquiries@legalombudsman.org.uk Address: PO Box 6167, Slough, SL1 0EH You must contact the Legal Ombudsman 10.',
      //     compliant: false,
      //     suggestion:
      //       'If you remain dissatisfied, you may refer the matter to the Legal Ombudsman at: Website: www.legalombudsman.org.uk Phone: 0300 555 0333 Email: enquiries@legalombudsman.org.uk Address: PO Box 6806, Wolverhampton, WV1 9WJ You must contact the Legal Ombudsman 10.',
      //     reason:
      //       'The address for the Legal Ombudsman is incorrect. The correct address is PO Box 6806, Wolverhampton, WV1 9WJ.',
      //     citations: ['https://www.legalombudsman.org.uk/contact-us/'],
      //   },
      //   {
      //     original:
      //       'Professional Indemnity Insurance We hold professional indemnity insurance in accordance with SRA requirements.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Further details, including the insurer’s name and contact details, are available upon request.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '11.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Termination of Services You may terminate our services at any time by providing written notice.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'We reserve the right to terminate services if: There is a breakdown in trust.',
      //     compliant: false,
      //     suggestion:
      //       'We reserve the right to terminate services if: There is a material breach of contract.',
      //     reason:
      //       "The phrase 'breakdown in trust' is too vague and may not meet the requirement for clear and precise terms in client contracts.",
      //     citations: [
      //       'https://www.sra.org.uk/solicitors/standards-regulations/code-conduct-solicitors/',
      //     ],
      //   },
      //   {
      //     original: 'Legal fees remain unpaid.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Continuing representation would breach legal or ethical obligations.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'If services are terminated, you will be responsible for any outstanding fees.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '12.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Governing Law & Regulation Our services are regulated by the Solicitors Regulation Authority (SRA) under SRA number [Insert Firm SRA Number].',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'This policy and any legal work carried out are governed by the laws of England and Wales.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original: '13.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      //   {
      //     original:
      //       'Client Acknowledgment By instructing Gerry’s Solicitors Ltd., you confirm that you have read, understood, and agreed to the terms outlined in this Client Care Policy.',
      //     compliant: true,
      //     suggestion: '',
      //     reason: '',
      //     citations: [],
      //   },
      // ];

      const nonCompliant = allResults.filter(
        (item: ComplianceResult) => !item.compliant
      );

      setResults(nonCompliant, fileText);
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
          <div className="mt-2 bg-white rounded-xl p-6 shadow-sm flex flex-col flex-grow">
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
      </div>
    </div>
  );
}
