'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthSlider } from '@/components/auth/auth-slider';
import { Logo } from '@/components/common/logo';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
    >
      <div className="flex min-h-screen bg-[#F8F8FF]">
        {/* Main authentication section */}
        <section
          className="flex-1 md:basis-1/2 px-8 py-12"
          aria-label="Authentication forms"
        >
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center space-y-8">
            <Logo
              outsideDomain={true}
              href={process.env.NEXT_PUBLIC_LANDING_URL}
            />
            {children}
          </div>
        </section>

        {/* Promotional slider - hidden on mobile for better performance */}
        <aside
          className="md:basis-1/2 p-8 hidden lg:flex items-center justify-center"
          aria-label="Product features"
          role="complementary"
        >
          <AuthSlider />
        </aside>
      </div>
    </GoogleOAuthProvider>
  );
}
