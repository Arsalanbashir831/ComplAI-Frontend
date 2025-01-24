import { Controller, type Control } from 'react-hook-form';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const enterpriseFormSchema = z.object({
  // Firm Information
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  address: z.string().min(1, 'Address is required'),
  website: z.string().url('Please enter a valid URL').or(z.string().length(0)),

  // Primary Contact
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.string().min(1, 'Role is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),

  // Firm Size
  numberOfEmployees: z.string().min(1, 'Number of employees is required'),
  practiceAreas: z.string().min(1, 'Practice areas are required'),

  // Key Requirements
  keyRequirements: z.string().min(1, 'Key requirements are required'),
});

export type EnterpriseFormValues = z.infer<typeof enterpriseFormSchema>;

interface EnterpriseFormFieldsProps {
  control: Control<EnterpriseFormValues>;
}

export function EnterpriseFormFields({ control }: EnterpriseFormFieldsProps) {
  return (
    <div className="space-y-8">
      {/* Firm Information Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-primary">Firm Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="firmName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="firmName">
                  Firm Name
                </Label>
                <Input id="firmName" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="registrationNumber"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="registrationNumber">
                  Registration Number
                </Label>
                <Input id="registrationNumber" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="address">
                  Address
                </Label>
                <Input id="address" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="website"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="website">
                  Website
                </Label>
                <Input id="website" type="url" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Primary Contact Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-primary">Primary Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="fullName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="fullName">
                  Full Name
                </Label>
                <Input id="fullName" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="role">
                  Role
                </Label>
                <Input id="role" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="email">
                  Email
                </Label>
                <Input id="email" type="email" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="phoneNumber">
                  Phone Number
                </Label>
                <Input id="phoneNumber" type="tel" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Firm Size Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-primary">Firm Size</h2>
        <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-4">
          <Controller
            name="numberOfEmployees"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="numberOfEmployees">
                  Number Of Employees
                </Label>
                <Input id="numberOfEmployees" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="practiceAreas"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label className="text-primary" htmlFor="practiceAreas">
                  Practice Areas
                </Label>
                <Input id="practiceAreas" {...field} />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="keyRequirements"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2 md:col-span-2">
                <Label className="text-primary" htmlFor="keyRequirements">
                  Key Requirements
                </Label>
                <Textarea
                  id="keyRequirements"
                  className="min-h-[100px]"
                  {...field}
                />
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
