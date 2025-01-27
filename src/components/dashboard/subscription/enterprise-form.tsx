'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';

import {
  EnterpriseFormFields,
  enterpriseFormSchema,
  type EnterpriseFormValues,
} from './enterprise-form-fields';

export function EnterpriseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<EnterpriseFormValues>({
    resolver: zodResolver(enterpriseFormSchema),
    defaultValues: {
      firmName: '',
      registrationNumber: '',
      address: '',
      website: '',
      fullName: '',
      role: '',
      email: '',
      phoneNumber: '',
      numberOfEmployees: '',
      practiceAreas: '',
      keyRequirements: '',
    },
  });

  const onSubmit = async (data: EnterpriseFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(data);
      reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 pb-20 bg-white shadow-md rounded-xl w-full mx-auto space-y-8"
    >
      <EnterpriseFormFields control={control} />

      <Button
        type="submit"
        className="w-full bg-[#1F2937] hover:bg-[#374151]"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Apply for Enterprise Plan'}
      </Button>
    </form>
  );
}
