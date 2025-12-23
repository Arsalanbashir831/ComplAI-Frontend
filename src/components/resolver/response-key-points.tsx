'use client';

import Image from 'next/image';

import { ScrollArea } from '@/components/ui/scroll-area';

interface KeyPoint {
  id: string;
  title: string;
  description: string;
}

const MOCK_KEY_POINTS: KeyPoint[] = [
  {
    id: '1',
    title: 'Formal acknowledgement of the complaint',
    description:
      "Confirm receipt of the customer's concern and demonstrate that it has been taken seriously and reviewed by the appropriate team.",
  },
  {
    id: '2',
    title: 'Clear and unambiguous apology',
    description:
      'Offer a sincere apology for the confusion and any inconvenience caused, without shifting responsibility or creating ambiguity.',
  },
  {
    id: '3',
    title: 'Summary of the investigation conducted',
    description:
      'State that the account and payment records were reviewed to assess the validity of the late fee applied.',
  },
  {
    id: '4',
    title: 'Confirmation of timely payment',
    description:
      "Explicitly confirm that the customer's payment was received within the required timeframe and that no delay occurred on their part.",
  },
  {
    id: '5',
    title: 'Clear and unambiguous apology',
    description:
      'Offer a sincere apology for the confusion and any inconvenience caused, without shifting responsibility or creating ambiguity.',
  },
  {
    id: '6',
    title: 'Clear and unambiguous apology',
    description:
      'Offer a sincere apology for the confusion and any inconvenience caused, without shifting responsibility or creating ambiguity.',
  },
  {
    id: '7',
    title: 'Clear and unambiguous apology',
    description:
      'Offer a sincere apology for the confusion and any inconvenience caused, without shifting responsibility or creating ambiguity.',
  },
];

export function ResponseKeyPoints() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {MOCK_KEY_POINTS.map((point) => (
            <div key={point.id} className="flex gap-4 border-b border-[#DFEAFF] pb-4">
              <div className="mt-1">
                <div className="">
                  <Image
                    src="/icons/double-check.svg"
                    alt="double-check"
                    width={23}
                    height={13}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-[#04338B] font-bold text-base">
                  {point.title}
                </h4>
                <p className="text-[#04338B] text-sm font-medium leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
