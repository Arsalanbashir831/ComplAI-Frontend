'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';

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
  code: z.string().min(4, {
    message: 'Verification code must be 4 characters long',
  }),
});

export function IdentityVerificationForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = (value: z.infer<typeof formSchema>) => {
    console.log('Verification Code:', value.code);
    // Call your verification API here

    router.push(ROUTES.CHAT);
  };

  const handleResend = async () => {
    // Logic to resend verification code
    console.log('Resend code');
  };

  return (
    <AuthFormLayout
      title="Identity Verification"
      subtitle="Enter the verification code sent to your email"
      footerText="Didn’t receive code?"
      footerLinkText="Resend OTP"
      handleFooterLinkClick={handleResend}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPSlot index={0} />
                        <InputOTPSeparator />
                        <InputOTPSlot index={1} />
                        <InputOTPSeparator />
                        <InputOTPSlot index={2} />
                        <InputOTPSeparator />
                        <InputOTPSlot index={3} />
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
