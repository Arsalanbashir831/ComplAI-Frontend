'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiCaller from '@/config/apiCaller';
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiCaller(
        API_ROUTES.AUTH.FORGOT_PASSWORD, // Replace with your actual endpoint
        'POST',
        { email: values.email },
        {},
        false,
        'json'
      );

      if (response.status === 200) {
        setMessage({
          type: 'success',
          text: 'OTP sent successfully. Check your email!',
        });
        setTimeout(() => {
          router.push(
            `${ROUTES.VERIFY_IDENTITY}?email=${encodeURIComponent(values.email)}&&type=forgetPassword`
          );
        }, 1500);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage({
          type: 'error',
          text:
            error.response.data?.message ||
            'Failed to send OTP. Please try again.',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'A network error occurred. Please check your connection.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Email Verification"
      subtitle="Enter your email to receive an OTP"
      footerText="Didn't receive a code?"
      footerLinkHref="#"
      footerLinkText="Resend Code"
      handleFooterLinkClick={
        !loading ? () => form.handleSubmit(onSubmit)() : undefined
      }
    >
      {/* ✅ Display success & error messages */}
      {message && (
        <p
          className={`text-sm text-center ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
        >
          {message.text}
        </p>
      )}

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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
