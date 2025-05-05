'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import apiCaller from '@/config/apiCaller';

import { useAuth } from '@/hooks/useAuth';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { InputOTP, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp';
import AuthFormLayout from './form-layout';

const formSchema = z.object({
  code: z.string().length(6, {
    message: 'Verification code must be 6 characters long',
  }),
});

export function IdentityVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type');
  const password = searchParams.get('password');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
const {signIn}  = useAuth()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '' },
  });

  const resetMessage = useCallback(() => setMessage(null), []);

  const handleResponse = (status: number, successMsg: string) => {
    if (status === 200 || status === 201) {
      setMessage({ type: 'success', text: successMsg });
      return true;
    }
    return false;
  };

  const handleError = (error: unknown, fallbackMsg: string) => {
    if (axios.isAxiosError(error) && error.response) {
      setMessage({
        type: 'error',
        text: error.response.data?.message || fallbackMsg,
      });
    } else {
      setMessage({
        type: 'error',
        text: 'A network error occurred. Please try again.',
      });
    }
  };

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    if (!email || !type || !password) {
      return setMessage({
        type: 'error',
        text: 'Email and type are required for verification.',
      });
    }

    setLoading(true);
    resetMessage();

    try {
      if (type === 'signup') {
        // ✅ Call API for signup verification
        const response = await apiCaller(
          API_ROUTES.AUTH.VERIFY_EMAIL,
          'POST',
          { email, otp: value.code },
          {},
          true,
          'json'
        );

        if (
          handleResponse(
            response.status,
            'Verification successful! Redirecting to login...'
          )
        ) {
          // new to call the login api to create session
       await signIn({email, password,type:'new'});
          // setTimeout(() => router.push(ROUTES.LOGIN), 2000);
        }
      } else {
        // ✅ Directly route to reset password with email & OTP
        router.push(
          `${ROUTES.RESET_PASSWORD}?email=${email}&otp=${value.code}`
        );
      }
    } catch (error) {
      handleError(error, 'Invalid verification code');
      form.setError('code', {
        type: 'manual',
        message: 'Invalid verification code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email)
      return setMessage({
        type: 'error',
        text: 'Email is required to resend verification.',
      });

    setResendLoading(true);
    resetMessage();

    try {
      const response = await apiCaller(
        API_ROUTES.AUTH.RESEND_VERIFICATION,
        'POST',
        { email },
        {},
        true,
        'json'
      );
      handleResponse(response.status, 'Verification code resent successfully.');
    } catch (error) {
      handleError(error, 'Failed to resend verification code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Identity Verification"
      subtitle="Enter the verification code sent to your email"
      footerText="Didn’t receive a code?"
      footerLinkText={resendLoading ? 'Resending...' : 'Resend OTP'}
      handleFooterLinkClick={!resendLoading ? handleResend : undefined}
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
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    {[...Array(6)].map((_, index) => (
                      <>
                        <InputOTPSlot key={index} index={index} />
                        {index < 5 && <InputOTPSeparator />}
                      </>
                    ))}
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
