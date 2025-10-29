'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiCaller from '@/config/apiCaller';
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
    email: z
      .string()
      .email('Invalid email address')
      // → normalize to lowercase right away
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z
      .string()
      .min(8, 'Confirm Password must be at least 8 characters long'),
    acceptTerms: z.boolean(),
  })
  // Passwords must match
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

// Password strength checker component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    return {
      score,
      checks,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      color:
        score < 2 ? 'bg-red-500' : score < 4 ? 'bg-yellow-500' : 'bg-green-500',
    };
  };

  const { score, checks, strength, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium capitalize text-gray-600">
          {strength}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div
          className={`flex items-center space-x-1 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}
        >
          <span>{checks.length ? '✓' : '○'}</span>
          <span>8+ characters (e.g., &#34;password123&#34;)</span>
        </div>
        <div
          className={`flex items-center space-x-1 ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}
        >
          <span>{checks.uppercase ? '✓' : '○'}</span>
          <span>
            Uppercase letter (e.g., &#34;A&#34;, &#34;B&#34;, &#34;C&#34;)
          </span>
        </div>
        <div
          className={`flex items-center space-x-1 ${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}
        >
          <span>{checks.lowercase ? '✓' : '○'}</span>
          <span>
            Lowercase letter (e.g., &#34;a&#34;, &#34;b&#34;, &#34;c&#34;)
          </span>
        </div>
        <div
          className={`flex items-center space-x-1 ${checks.number ? 'text-green-600' : 'text-gray-400'}`}
        >
          <span>{checks.number ? '✓' : '○'}</span>
          <span>Number (e.g., &#34;1&#34;, &#34;2&#34;, &#34;3&#34;)</span>
        </div>
        <div
          className={`flex items-center space-x-1 ${checks.special ? 'text-green-600' : 'text-gray-400'}`}
        >
          <span>{checks.special ? '✓' : '○'}</span>
          <span>
            Special character (e.gl, &#34;!&#34;, &#34;@&#34;, &#34;#&#34;
            &#34;$&#34;)
          </span>
        </div>
      </div>
    </div>
  );
};

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const subscription = searchParams.get('subscription');
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        if (subscription && subscription === 'topup') {
          router.push(
            `${ROUTES.VERIFY_IDENTITY}?email=${values.email}&type=signup&password=${values.password}&subscription=topup`
          );
        } else if (subscription && subscription === 'monthly') {
          router.push(
            `${ROUTES.VERIFY_IDENTITY}?email=${values.email}&type=signup&password=${values.password}&subscription=monthly`
          );
        } else {
          router.push(
            `${ROUTES.VERIFY_IDENTITY}?email=${values.email}&type=signup&&password=${values.password}`
          );
        }
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
      footerLinkHref={
        subscription
          ? subscription === 'topup'
            ? `${ROUTES.LOGIN}?subscription=topup`
            : `${ROUTES.LOGIN}?subscription=monthly`
          : ROUTES.LOGIN
      }
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
                <PasswordStrengthIndicator password={field.value} />
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
