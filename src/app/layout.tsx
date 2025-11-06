import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { AbortControllerProvider } from '@/contexts/abort-controller-context';
import { ChatProvider } from '@/contexts/chat-context';
import { LoaderProvider } from '@/contexts/loader-context';
import { PromptProvider } from '@/contexts/prompt-context';
import { UserProvider } from '@/contexts/user-context';
import AuthProvider from '@/provider/AuthProvider';
import QueryProvider from '@/provider/QueryClientProvider';

import { Toaster } from '@/components/ui/sonner';
import LoadingSpinner from '@/components/common/loading-spinner';

import './globals.css';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Compl-AI | Log In or Register Now',
  description:
    'Log in or create your Compl-AI account to access powerful tools that simplify SRA compliance for regulated law firms across England and Wales.',
  metadataBase: new URL('https://app.compl-ai.co.uk'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Compl-AI | Log In or Register Now',
    description:
      'Log in or create your Compl-AI account to access powerful tools that simplify SRA compliance for regulated law firms across England and Wales.',
    url: 'https://app.compl-ai.co.uk',
    siteName: 'Compl-AI',
    type: 'website',
    images: [
      {
        url: 'https://app.compl-ai.co.uk/logo.png',
        width: 1200,
        height: 630,
        alt: 'Compl-AI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compl-AI - AI-powered Compliance Assistant',
    description: 'Compl-AI is a compliance assistant for family offices.',
    images: ['https://app.compl-ai.co.uk/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans bg-background text-foreground ${poppins}`}>
        <AbortControllerProvider>
          <ChatProvider>
            <PromptProvider>
              <QueryProvider>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-screen">
                      <LoadingSpinner />
                    </div>
                  }
                >
                  <AuthProvider>
                    <LoaderProvider>
                      <UserProvider>{children}</UserProvider>

                      <Toaster richColors />
                    </LoaderProvider>
                  </AuthProvider>
                </Suspense>
              </QueryProvider>
            </PromptProvider>
          </ChatProvider>
        </AbortControllerProvider>
      </body>
    </html>
  );
}
