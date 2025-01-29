'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DateRangePicker({
  value,
  onChange,
  disabled,
  icon = <CalendarIcon className="ml-auto h-4 w-4 text-gray-dark" />,
  className,
}: Readonly<{
  value: DateRange | undefined;
  onChange: (dateRange: DateRange | undefined) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}>) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (newRange: DateRange | undefined) => {
    setDate(newRange);
    onChange(newRange);
  };

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
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            <span>Select date range</span>
          )}
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date} // ✅ Directly pass the selected range
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
