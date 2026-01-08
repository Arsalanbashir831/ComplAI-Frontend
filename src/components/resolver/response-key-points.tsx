'use client';

import Image from 'next/image';

import { ScrollArea } from '@/components/ui/scroll-area';

interface ResponseKeyPointsProps {
  points: { title: string; description: string }[];
  isLoading?: boolean;
}

export function ResponseKeyPoints({
  points,
  isLoading,
}: ResponseKeyPointsProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#04338B] border-t-transparent" />
      </div>
    );
  }

  if (!points || points.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-[#626262]">No key points extracted yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {points.map((point, index) => (
            <div
              key={index}
              className="flex gap-4 border-b border-[#DFEAFF] pb-4"
            >
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
