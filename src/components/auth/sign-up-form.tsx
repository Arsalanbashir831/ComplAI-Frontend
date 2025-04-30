'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LockKeyhole, Mail, User2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import apiCaller from '@/config/apiCaller';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Separator } from '../ui/separator';
import AuthFormLayout from './form-layout';
import { OAuthButtons } from './outh-buttons';

const formSchema = z
  .object({
    username: z
      .string()
      .min(2, 'Username must be at least 2 characters long'),
    email: z
      .string()
      .email('Invalid email address')
      // → normalize to lowercase right away
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm Password must be at least 8 characters long'),
    acceptTerms: z.boolean(),
  })
  // 1) Passwords must match
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  })
  // 2) Username and email must not be the same (case-insensitive)
  .refine((data) => data.username.toLowerCase() !== data.email, {
    path: ['username'],
    message: 'Username and email must not be the same',
  });


export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiCaller(
        API_ROUTES.AUTH.SIGNUP,
        'POST',
        {
          username: values.username,
          email: values.email,
          password: values.password,
        },
        {},
        false,
        'json'
      );

      if (response.status === 201) {
        setSuccessMessage(
          'Account created successfully! Please verify your email.'
        );
        form.reset();
        await apiCaller(API_ROUTES.AUTH.RESEND_VERIFICATION, 'POST', {
          email: values.email,
        });
        router.push(
          `${ROUTES.VERIFY_IDENTITY}?email=${values.email}&&type=signup`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          if (data.email) setError(data.email[0]);
          else if (data.password) setError(data.password[0]);
          else setError('Invalid input. Please check your details.');
        } else if (status === 401) {
          setError('Not Found Resources');
        } else {
          setError(data.message || 'An unexpected error occurred.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Create your account"
      subtitle="Please fill this to create an account"
      footerText="Already have an account?"
      footerLinkHref={ROUTES.LOGIN}
      footerLinkText="Login"
    >
      <OAuthButtons />

      <div className="flex gap-2 items-center justify-center overflow-hidden">
        <Separator className="bg-[#BABABA]" />
        <p className="text-xs text-gray-700">OR</p>
        <Separator className="bg-[#BABABA]" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successMessage && (
            <p className="text-green-500 text-sm">{successMessage}</p>
          )}

          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Username"
                    startIcon={<User2 className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter password"
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
                    placeholder="Confirm password"
                    startIcon={<LockKeyhole className="h-4 w-4" />}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel htmlFor="acceptTerms" className="text-xs">
                    Remember me
                  </FormLabel>
                </div>
              )}
            />
            <Link
              href={ROUTES.RESET_PASSWORD}
              className="text-xs text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
