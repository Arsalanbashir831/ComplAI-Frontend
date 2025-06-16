'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import DocxViewer from '@/components/common/DocxViewer';

export default function UserAgreementPage() {
  const [agreed, setAgreed] = useState(false);
  const { signIn } = useAuth();

  const searchParams = useSearchParams();

  const email = searchParams.get('email');
  const password = searchParams.get('password');
  const subscription = searchParams.get('subscription');
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setAgreed(e.target.checked);
  };

  const handleContinue = async () => {
    if (agreed && email && password && !subscription) {
      await signIn({ email, password, type: 'new' });
      console.log('User agreed. Continue...');
    }
    if (agreed && email && password && subscription === 'monthly') {
      await signIn({ email, password, type: 'new' });
    } else if (agreed && email && password && subscription === 'topup') {
      await signIn({ email, password, type: 'new' });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center  ">
      <div className="w-full  ">
        <DocxViewer
          filePath="/docs/USER LICENCE AGREEMENT.docx"
          heading="User License & Agreement"
          containerClassName=" rounded-lg w-full"
          headingClassName="text-3xl font-semibold text-indigo-700 mb-6"
        />
      </div>

      <div className="mt-8 w-full max-w-3xl flex flex-col items-center">
        <label className="flex items-start space-x-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={agreed}
            onChange={handleCheckboxChange}
            className="mt-1 h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
          />
          <span>I have read and agree to the User License & Agreement.</span>
        </label>

        <Button
          onClick={handleContinue}
          disabled={!agreed}
          className="mt-6 w-full max-w-xs"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
