'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function SupportForm() {
  const [selectedVersion, setSelectedVersion] = useState('');

  return (
    <div className="gap-8 px-4 md:px-0">
      {/* Form: Displayed first on mobile, second on desktop */}
      <div className="space-y-4 flex-1 order-1 md:order-2">
        <Input placeholder="Your full name" className="py-6" />
        <Input type="email" placeholder="Your email" className="py-6" />

        {/* Version Dropdown */}
        <Select onValueChange={setSelectedVersion}>
          <SelectTrigger
            className={cn(!selectedVersion && 'text-muted-foreground')}
          >
            <SelectValue placeholder="Version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="version1">Compl-AI-v1</SelectItem>
            {/* <SelectItem value="version2">Version 22</SelectItem> */}
          </SelectContent>
        </Select>

        <Textarea placeholder="Description" className="h-[200px] py-6" />
        <Button className="w-full transition-all duration-300 ease-in-out ">
          Submit Support Request
        </Button>
      </div>
    </div>
  );
}
