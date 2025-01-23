'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({
  className,
  disabled,
  icon = <CalendarIcon className="ml-auto h-4 w-4 text-gray-dark" />,
}: Readonly<{
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}>) {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-fit justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            disabled && 'cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          {date ? format(date, 'PPP') : <span>Select Date</span>}
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
