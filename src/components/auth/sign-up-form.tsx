'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, Mail, User2 } from 'lucide-react';
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
import { Separator } from '../ui/separator';
import AuthFormLayout from './form-layout';
import { OAuthButtons } from './outh-buttons';

const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters long'),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export function SignUpForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values);
    router.push(ROUTES.VERIFY_EMAIL);
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
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
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
                  {/* <FormLabel htmlFor="agreeTerms">
                    I agree to the{' '}
                    <Link
                      href={ROUTES.TERMS}
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href={ROUTES.PRIVACY}
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </FormLabel> */}
                  <FormLabel htmlFor="acceptTerms" className="text-xs">
                    Remeber me
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
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
