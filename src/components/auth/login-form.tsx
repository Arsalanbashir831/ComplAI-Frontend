'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import AuthFormLayout from './form-layout';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values);
  };

  return (
    <AuthFormLayout
      title="Login to your account"
      subtitle="Glad to see you again! Please enter your details."
      footerText="Don't have an account?"
      footerLinkHref={ROUTES.SIGN_UP}
      footerLinkText="Sign up"
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

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
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
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel htmlFor="rememberMe">Remember me</FormLabel>
                </div>
              )}
            />
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
