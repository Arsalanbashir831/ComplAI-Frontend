'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput(props: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input type={showPassword ? 'text' : 'password'} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
