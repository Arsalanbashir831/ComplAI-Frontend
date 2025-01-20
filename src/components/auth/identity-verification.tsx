'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// import { useAuth } from "@/features/auth/hooks/use-auth"
// import { useForm } from "@/hooks/use-form"

export function IdentityVerificationForm() {
  // const { verifyIdentity, resendVerificationCode } = useAuth()
  // const { values, handleChange } = useForm({
  //   code: ["", "", "", ""],
  // })
  const values = { code: ['', '', '', ''] };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      // const newCode = [...values.code]
      // newCode[index] = value
      // handleChange({ target: { name: "code", value: newCode } })

      if (value !== '' && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // await verifyIdentity(values.code.join(""))
  };

  const handleResend = async () => {
    // await resendVerificationCode()
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Verify your identity
        </h1>
        <p className="text-gray-500">
          We&rsquo;ve sent a security code to your email
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code-0">Verification Code</Label>
          <div className="flex gap-4">
            {values.code.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                name={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="\d{1}"
                maxLength={1}
                className="w-14 text-center text-2xl"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                required
              />
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full">
          Verify
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        Didn&rsquo;t receive code?{' '}
        <button
          onClick={handleResend}
          className="text-blue-600 hover:underline"
        >
          Resend Code
        </button>
      </p>
    </div>
  );
}
