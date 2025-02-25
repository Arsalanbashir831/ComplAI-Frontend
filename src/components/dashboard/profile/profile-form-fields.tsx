import { BriefcaseBusiness, Mail, User2 } from 'lucide-react';
import { Controller, type Control } from 'react-hook-form';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/common/date-picker';
import { PhoneInput } from '@/components/dashboard/profile/phone-input';

export const profileSchema = z.object({
  id: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),

  phoneNumber: z.string().regex(/^\+\d+\s*\d+$/, 'Invalid phone number'),

  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
  creationDate: z.date(),
  // notificationsEnabled: z.boolean(),
  // emailUpdates: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormFieldsProps {
  control: Control<ProfileFormValues>;
  isEditable: boolean;
}

export function ProfileFormFields({
  control,
  isEditable,
}: ProfileFormFieldsProps) {
  const inputFields = [
    {
      name: 'username' as const,
      label: 'Username',
      placeholder: 'Username',
      icon: <User2 size={16} />,
    },
    {
      name: 'email' as const,
      label: 'Email Address',
      placeholder: 'john.doe@gmail.com',
      type: 'email',
      icon: <Mail size={16} />,
      disabled: true,
    },
    {
      name: 'jobTitle' as const,
      label: 'Job Title',
      placeholder: 'Job Title',
      icon: <BriefcaseBusiness size={16} />,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inputFields.map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name} className="text-[#000] font-bold">
                  {field.label}
                </Label>

                <Input
                  id={field.name}
                  className="border-[#D1D5DB] disabled:bg-gray-light"
                  disabled={!isEditable || field.disabled}
                  value={value}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  type={field.type}
                  startIcon={field.icon}
                />

                {error && (
                  <p className="text-red-500 text-sm">{error.message}</p>
                )}
              </div>
            )}
          />
        ))}

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="phoneNumber" className="text-[#000] font-bold">
                Phone Number
              </Label>
              <PhoneInput
                value={value}
                onChange={onChange}
                disabled={!isEditable}
              />
              {error && <p className="text-red-500 text-sm">{error.message}</p>}
            </div>
          )}
        />

        <Controller
          name="creationDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-col gap-2">
              <Label className="text-[#000] font-bold">
                Account Creation Date
              </Label>
              <DatePicker
                className="w-full border-[#D1D5DB] disabled:bg-gray-light"
                disabled={true}
                value={value}
                onChange={onChange}
              />
            </div>
          )}
        />
      </div>

      {/* <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
        {[
          {
            name: 'notificationsEnabled' as const,
            label: 'Notifications Enabled',
          },
          { name: 'emailUpdates' as const, label: 'Email Updates' },
        ].map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="flex items-center">
                <Checkbox
                  id={field.name}
                  checked={value}
                  onCheckedChange={onChange}
                  disabled={!isEditable}
                />
                <label
                  htmlFor={field.name}
                  className="ml-2 text-sm font-medium"
                >
                  {field.label}
                </label>
              </div>
            )}
          />
        ))}
      </div> */}
    </>
  );
}
