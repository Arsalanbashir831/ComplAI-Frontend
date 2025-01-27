'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search in videos',
}: SearchInputProps) {
  return (
    <div className="relative">
      {/* <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 border-[#E0E4EE] text-[#596375] rounded-xl"
        startIcon={<Search className="h-4 w-4" />}
      />
    </div>
  );
}
