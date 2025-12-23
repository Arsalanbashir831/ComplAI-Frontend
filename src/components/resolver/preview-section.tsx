'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

import { Card } from '@/components/ui/card';

interface PreviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function PreviewSection({
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
        className="w-full flex items-center justify-between py-2 outline-none group"
      >
        <div className="flex items-center gap-3">
          <Card className="w-14 h-14 bg-primary border-none rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
            {icon}
          </Card>
          <h3 className="text-lg font-medium text-[#04338B] transition-colors group-hover:text-primary">
            {title}
          </h3>
        </div>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-transform hover:scale-110 duration-200">
          <motion.div
            initial={false}
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {isExpanded ? (
              <Minus className="text-white h-4 w-4" />
            ) : (
              <Plus className="text-white h-4 w-4" />
            )}
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 pl-13">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
