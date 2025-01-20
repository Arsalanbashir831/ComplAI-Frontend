'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EmailVerificationForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // await verifyEmail(values.email)
  };

  const handleResend = async () => {
    // await resendVerificationEmail(values.email)
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Email Verification
        </h1>
        <p className="text-gray-500">Enter your email for verification</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            // value={values.email}
            // onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Send Verification Email
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        Didn&rsquo;t receive code?{' '}
        <button
          onClick={handleResend}
          className="text-blue-600 hover:underline"
        >
          Resend Verification Email
        </button>
      </p>
    </div>
  );
}
