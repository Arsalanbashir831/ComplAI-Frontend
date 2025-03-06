'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LockKeyhole } from 'lucide-react';
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

const formSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email'); // ✅ Get email from query
  const otp = searchParams.get('otp'); // ✅ Get OTP from query

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!email || !otp) {
      setMessage({
        type: 'error',
        text: 'Invalid reset link. Missing email or OTP.',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiCaller(
        API_ROUTES.AUTH.RESET_PASSWORD, // ✅ Replace with your actual reset password endpoint
        'POST',
        { email, otp, new_password: values.password },
        {},
        false,
        'json'
      );

      if (response.status === 200) {
        setMessage({
          type: 'success',
          text: 'Password reset successful! Redirecting to login...',
        });

        setTimeout(() => router.push(ROUTES.LOGIN), 2000);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage({
          type: 'error',
          text:
            error.response.data?.message ||
            'Failed to reset password. Please try again.',
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
      title="Reset Password"
      subtitle="Enter your new password to continue"
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
          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter new password"
                    startIcon={<LockKeyhole className="h-4 w-4" />}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Confirm new password"
                    startIcon={<LockKeyhole className="h-4 w-4" />}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
