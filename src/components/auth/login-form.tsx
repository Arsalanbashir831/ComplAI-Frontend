'use client';

import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

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

// import { useSearchParams } from 'next/navigation';
// import { useSubscription } from '@/hooks/useSubscription';

// ✅ No restriction on password length but it is required
const formSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((val) => val.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

function LoginFormInner() {
  const { signIn, loading, error } = useAuth();
  const searchParams = useSearchParams();
  const subscription = searchParams.get('subscription');
  // const {handleSubscription} = useSubscription()
  //   useEffect(() => {
  //     if (!subscription) return;
  // if(subscription==='monthly' ){
  //   handleSubscription('monthly');
  // }else if(subscription==='topup'){
  //   handleSubscription('topup');
  // }

  //   }, [subscription, handleSubscription]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await signIn({
      email: values.email,
      password: values.password,
      type: 'old',
    });
    // try {
    //   const response = await apiCaller(
    //     API_ROUTES.AUTH.LOGIN,
    //     'POST',
    //     { email: values.email, password: values.password },
    //     {},
    //     false,
    //     'json'
    //   );

    //   if (response.status === 200) {
    //     const { access, refresh } = response.data;
    //     localStorage.setItem('accessToken', access);
    //     localStorage.setItem('refreshToken', refresh);
    //     router.push(ROUTES.DASHBOARD);
    //   }
    // } catch (error: unknown) {
    //   if (axios.isAxiosError(error) && error.response) {
    //     setErrorMessage(
    //       error.response.data?.message || 'Invalid email or password.'
    //     );
    //   } else {
    //     setErrorMessage('A network error occurred. Please try again.');
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <AuthFormLayout
      title="Login to your account"
      subtitle="Glad to see you again! Please enter your details."
      footerText="Don't have an account?"
      footerLinkHref={
        subscription
          ? subscription === 'topup'
            ? `${ROUTES.SIGN_UP}?subscription=topup`
            : `${ROUTES.SIGN_UP}?subscription=monthly`
          : ROUTES.SIGN_UP
      }
      footerLinkText="Sign up"
    >
      <div className="className='flex justify-center items-center'">
        <OAuthButtons />
      </div>

      <div className="flex gap-2 items-center justify-center overflow-hidden">
        <Separator className="bg-[#BABABA]" />
        <p className="text-xs text-gray-700">OR</p>
        <Separator className="bg-[#BABABA]" />
      </div>

      {/* ✅ Display error message */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
                  <FormLabel htmlFor="rememberMe" className="text-xs">
                    Remember me
                  </FormLabel>
                </div>
              )}
            />
            <Link
              href={ROUTES.VERIFY_EMAIL}
              className="text-xs text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormInner />
    </Suspense>
  );
}

function LoginFormFallback() {
  return (
    <AuthFormLayout
      title="Login to your account"
      subtitle="Glad to see you again! Please enter your details."
      footerText="Don't have an account?"
      footerLinkHref={ROUTES.SIGN_UP}
      footerLinkText="Sign up"
    >
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </AuthFormLayout>
  );
}
