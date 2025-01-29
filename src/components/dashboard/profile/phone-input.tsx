import React from 'react';
// Import the JSON file
import countryCodes from '@/data/country-codes.json';
import { Phone } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const [countryCode, localNumber] = React.useMemo(() => {
    const match = value.match(/^\+(\d+)\s*(.*)$/);
    return match ? [`+${match[1]}`, match[2]] : ['+1', value];
  }, [value]);

  const handleCountryCodeChange = (newCode: string) => {
    onChange(`${newCode} ${localNumber}`);
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${countryCode} ${e.target.value}`);
  };

  return (
    <div className="flex">
      <Select
        disabled={disabled}
        value={countryCode}
        onValueChange={handleCountryCodeChange}
      >
        <SelectTrigger
          className="w-fit space-x-2 border-r-0 rounded-r-none py-[19px]"
          startIcon={<Phone className="h-4 w-4 opacity-50" />}
        >
          <SelectValue>{countryCode}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* remove duplicates */}
          {countryCodes
            .filter(
              (country, index, self) =>
                index ===
                self.findIndex((t) => t.dial_code === country.dial_code)
            )
            .sort((a, b) => a.dial_code.localeCompare(b.dial_code))
            .map((country) => (
              <SelectItem key={country.code} value={country.dial_code}>
                {country.dial_code}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <div className="relative flex-grow">
        <Input
          className="rounded-l-none"
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
