'use client';

import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import apiCaller from '@/config/apiCaller';

// import { useAuth } from '@/hooks/useAuth';

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
  const subscription = searchParams.get('subscription');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  // const { signIn } = useAuth();

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

  // const handleError = (error: unknown, fallbackMsg: string) => {
  //   if (axios.isAxiosError(error) && error.response) {
  //     setMessage({
  //       type: 'error',
  //       text: error.response.data?.message || fallbackMsg,
  //     });
  //   } else {
  //     setMessage({
  //       type: 'error',
  //       text: 'A network error occurred. Please try again.',
  //     });
  //   }
  // };

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    if (!email || !type) {
      return setMessage({
        type: 'error',
        text: 'Email and type are required for verification.',
      });
    }

    setLoading(true);
    resetMessage();

    try {
      if (type === 'signup') {
        // ✅ Call API for signup verification with retry logic
        const response = await verifyEmailWithRetry(email, value.code, 3);

        if (
          handleResponse(
            response.status,
            'Verification successful! Redirecting...'
          )
        ) {
          // Build redirect URL with proper encoding
          const redirectUrl = buildUserAgreementUrl(email, password, subscription);
          router.push(redirectUrl);
        }
      } else {
        // ✅ Directly route to reset password with email & OTP
        const resetUrl = `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(value.code)}`;
        router.push(resetUrl);
      }
    } catch (error) {
      handleVerificationError(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to verify email with retry logic
  const verifyEmailWithRetry = async (email: string, otp: string, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await apiCaller(
          API_ROUTES.AUTH.VERIFY_EMAIL,
          'POST',
          { email, otp },
          {},
          true,
          'json'
        );
        return response;
      } catch (error) {
        console.warn(`Verification attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error; // Re-throw the last error
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('All verification attempts failed');
  };

  // Helper function to build user agreement URL
  const buildUserAgreementUrl = (email: string, password: string | null, subscription: string | null): string => {
    const baseUrl = `${ROUTES.USER_AGGREMENT}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password || '')}`;
    
    if (subscription === 'topup') {
      return `${baseUrl}&subscription=topup`;
    } else if (subscription === 'monthly') {
      return `${baseUrl}&subscription=monthly`;
    }
    
    return baseUrl;
  };

  // Helper function to handle verification errors
  const handleVerificationError = (error: unknown): void => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          setMessage({
            type: 'error',
            text: data?.otp?.[0] || data?.email?.[0] || 'Invalid verification code. Please check and try again.',
          });
          break;
        case 401:
          setMessage({
            type: 'error',
            text: 'Verification code has expired. Please request a new one.',
          });
          break;
        case 404:
          setMessage({
            type: 'error',
            text: 'Verification code not found. Please request a new one.',
          });
          break;
        case 429:
          setMessage({
            type: 'error',
            text: 'Too many verification attempts. Please wait a moment and try again.',
          });
          break;
        case 500:
          setMessage({
            type: 'error',
            text: 'Server error. Please try again later.',
          });
          break;
        default:
          setMessage({
            type: 'error',
            text: data?.message || data?.detail || 'Verification failed. Please try again.',
          });
      }
    } else if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        setMessage({
          type: 'error',
          text: 'Request timeout. Please check your connection and try again.',
        });
      } else if (error.code === 'NETWORK_ERROR') {
        setMessage({
          type: 'error',
          text: 'Network error. Please check your connection and try again.',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Connection failed. Please check your internet connection and try again.',
        });
      }
    } else {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    }

    form.setError('code', {
      type: 'manual',
      message: 'Invalid verification code',
    });
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
      // Add retry logic for resend as well
      await resendVerificationWithRetry(email, 3);
      setMessage({
        type: 'success',
        text: 'Verification code resent successfully.',
      });
    } catch (error) {
      handleResendError(error);
    } finally {
      setResendLoading(false);
    }
  };

  // Helper function to resend verification with retry logic
  const resendVerificationWithRetry = async (email: string, maxRetries: number = 3): Promise<void> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await apiCaller(
          API_ROUTES.AUTH.RESEND_VERIFICATION,
          'POST',
          { email },
          {},
          true,
          'json'
        );
        
        if (response.status === 200 || response.status === 201) {
          return; // Success, exit retry loop
        }
        
        throw new Error(`Unexpected response status: ${response.status}`);
      } catch (error) {
        console.warn(`Resend attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error; // Re-throw the last error
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  // Helper function to handle resend errors
  const handleResendError = (error: unknown): void => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          setMessage({
            type: 'error',
            text: data?.email?.[0] || 'Invalid email address.',
          });
          break;
        case 429:
          setMessage({
            type: 'error',
            text: 'Too many resend attempts. Please wait a moment before trying again.',
          });
          break;
        case 500:
          setMessage({
            type: 'error',
            text: 'Server error. Please try again later.',
          });
          break;
        default:
          setMessage({
            type: 'error',
            text: data?.message || data?.detail || 'Failed to resend verification code.',
          });
      }
    } else if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        setMessage({
          type: 'error',
          text: 'Request timeout. Please check your connection and try again.',
        });
      } else if (error.code === 'NETWORK_ERROR') {
        setMessage({
          type: 'error',
          text: 'Network error. Please check your connection and try again.',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Connection failed. Please check your internet connection and try again.',
        });
      }
    } else {
      setMessage({
        type: 'error',
        text: 'Failed to resend verification code. Please try again.',
      });
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
                      <React.Fragment key={index}>
                        <InputOTPSlot index={index} />
                        {index < 5 && <InputOTPSeparator />}
                      </React.Fragment>
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
