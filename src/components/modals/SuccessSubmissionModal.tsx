import * as React from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SuccessSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const SuccessSubmissionModal: React.FC<SuccessSubmissionModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl text-center px-6 py-8">
        {/* Logo */}
        {/* <div className="flex justify-center mb-4">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </div> */}

        <DialogHeader>
          <div className="flex flex-col items-center gap-2">
            {/* <CheckCircle2 className="text-blue-500 w-12 h-12" /> */}
            <Image src={'/favicon.svg'} alt="favicon" width={50} height={50} />
            <DialogTitle className="text-2xl font-bold text-blue-600">
              Thank You for Reaching Out!
            </DialogTitle>
          </div>
        </DialogHeader>

        <p className="mt-2 text-gray-700">
          We’ve received your message and our team will get back to you as soon
          as possible. In the meantime, feel free to explore our website or
          check out our latest updates. We look forward to connecting with you
          soon!
        </p>

        <DialogFooter>
          <Button onClick={onClose} className="w-full mt-6">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessSubmissionModal;
