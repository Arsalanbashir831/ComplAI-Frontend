import React from 'react';
import { Phone } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  // Always use +44 as the country code
  const countryCode = '+44';

  // Extract local number (strip any leading +44)
  const localNumber = React.useMemo(() => {
    const pattern = /^\+44\s*(.*)$/;
    const match = value.match(pattern);
    return match ? match[1] : value;
  }, [value]);

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${countryCode} ${e.target.value}`);
  };

  return (
    <div className="flex">
      <div className="flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-light">
        <Phone className="h-4 w-4 opacity-50" />
        <span className="ml-1 font-medium">{countryCode}</span>
      </div>
      <div className="relative flex-grow">
        <Input
          className="rounded-l-none rounded-r-lg"
          disabled={disabled}
          value={localNumber}
          onChange={handleLocalNumberChange}
          placeholder="Phone number"
          type="tel"
        />
      </div>
    </div>
  );
}
