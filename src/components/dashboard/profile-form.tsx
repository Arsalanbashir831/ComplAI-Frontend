'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BriefcaseBusiness, Mail, Phone, User2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DatePicker } from '../common/date-picker';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export default function ProfileForm() {
  const [isEditable, setIsEditable] = useState(false);

  const toggleEdit = () => setIsEditable((prev) => !prev);

  return (
    <div className="p-6 pb-20 bg-white shadow-md rounded-xl w-full mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <Image
          src="/user.png"
          alt="Profile Avatar"
          width={64}
          height={64}
          className="rounded-full object-cover"
        />
        <h1 className="text-xl md:text-3xl font-bold">John Doe</h1>
        <div className="md:ml-auto flex gap-4">
          <Button
            variant={isEditable ? 'outline' : 'default'}
            onClick={toggleEdit}
          >
            {isEditable ? 'Cancel' : 'Edit Info'}
          </Button>
          {isEditable && <Button onClick={toggleEdit}>Save Changes</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            label: 'Username',
            placeholder: 'Username',
            icon: <User2 size={16} />,
          },
          {
            label: 'Email Address',
            placeholder: 'john.doe@gmail.com',
            type: 'email',
            icon: <Mail size={16} />,
          },
          {
            label: 'Phone Number',
            placeholder: 'Phone number',
            type: 'tel',
            icon: <Phone size={16} />,
          },
          {
            label: 'Job Title',
            placeholder: 'Job Title',
            icon: <BriefcaseBusiness size={16} />,
          },
        ].map(({ label, ...props }, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Label className="text-primary font-bold">{label}</Label>
            <Input
              className="border-[#D1D5DB]"
              disabled={!isEditable}
              {...props}
            />
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <Label className="text-primary font-bold">Account Type</Label>
          <Select disabled={!isEditable}>
            <SelectTrigger className="border-[#D1D5DB]">
              <SelectValue placeholder="Select Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-primary font-bold">
            Account Creation Date
          </Label>
          <DatePicker
            className="w-full border-[#D1D5DB]"
            disabled={!isEditable}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
        {[
          { id: 'notifications', label: 'Notifications Enabled' },
          { id: 'email-updates', label: 'Email Updates' },
        ].map(({ id, label }) => (
          <div key={id} className="flex items-center">
            <Checkbox id={id} disabled={!isEditable} />
            <label htmlFor={id} className="ml-2 text-sm font-medium">
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
