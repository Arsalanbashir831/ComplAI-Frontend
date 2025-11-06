'use client';

import { useEffect, useState } from 'react';

interface SafeDateDisplayProps {
  date: string | Date;
  format?: 'date' | 'time' | 'datetime' | 'full';
  className?: string;
}

/**
 * Component that safely renders dates without causing hydration errors
 * by only rendering the formatted date on the client side
 */
export function SafeDateDisplay({
  date,
  format = 'datetime',
  className,
}: SafeDateDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches the expected height/width on server
    return <span className={className}>Loading...</span>;
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  let formattedDate = '';
  switch (format) {
    case 'date':
      formattedDate = dateObj.toLocaleDateString('en-US');
      break;
    case 'time':
      formattedDate = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      break;
    case 'datetime':
      formattedDate = dateObj.toLocaleString('en-US');
      break;
    case 'full':
      formattedDate = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      break;
  }

  return <span className={className}>{formattedDate}</span>;
}

interface SafeDateRangeDisplayProps {
  date: string | Date;
  className?: string;
}

/**
 * Component that safely renders dates in a split format (date + time)
 * without causing hydration errors
 */
export function SafeDateRangeDisplay({
  date,
  className,
}: SafeDateRangeDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={className}>
        <span className="text-sm font-medium">Loading...</span>
        <span className="text-xs text-[#999999]">Loading...</span>
      </div>
    );
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return (
    <div className={className}>
      <span className="text-sm font-medium">
        {dateObj.toLocaleDateString('en-US')}
      </span>
      <span className="text-xs text-[#999999]">
        {dateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })}
      </span>
    </div>
  );
}
