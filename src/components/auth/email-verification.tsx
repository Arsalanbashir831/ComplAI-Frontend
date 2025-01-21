'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import AuthFormLayout from './form-layout';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export function EmailVerificationForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values);

    router.push(ROUTES.VERIFY_IDENTITY);
  };

  return (
    <AuthFormLayout
      title="Email Verification"
      subtitle="Enter your email for verification"
      footerText="Didn't receive code?"
      footerLinkHref={ROUTES.SIGN_UP}
      footerLinkText="Resend Email"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    startIcon={<Mail className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Send OTP
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
