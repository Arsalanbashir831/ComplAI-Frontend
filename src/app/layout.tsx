import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Poppins } from 'next/font/google';

import AppProviders from '@/app/providers';
import SkipToContent from '@/components/common/skip-to-content';
import { cn } from '@/lib/utils';

import './globals.css';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Compl-AI | AI-Powered Compliance for Law Firms',
    template: '%s | Compl-AI',
  },
  description:
    'Log in or create your Compl-AI account to access powerful tools that simplify SRA compliance for regulated law firms across England and Wales.',
  metadataBase: new URL('https://app.compl-ai.co.uk'),
  applicationName: 'Compl-AI',
  authors: [{ name: 'Compl-AI Team' }],
  generator: 'Next.js',
  keywords: [
    'compliance',
    'SRA',
    'legal compliance',
    'AI assistant',
    'law firms',
    'regulatory compliance',
    'document compliance',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Compl-AI',
  publisher: 'Compl-AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    title: 'Compl-AI | AI-Powered Compliance for Law Firms',
    description:
      'Access powerful tools that simplify SRA compliance for regulated law firms across England and Wales.',
    url: 'https://app.compl-ai.co.uk',
    siteName: 'Compl-AI',
    images: [
      {
        url: 'https://app.compl-ai.co.uk/logo.png',
        width: 1200,
        height: 630,
        alt: 'Compl-AI - AI-Powered Compliance Assistant',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compl-AI - AI-powered Compliance Assistant',
    description:
      'Simplify SRA compliance for regulated law firms with AI-powered tools.',
    images: ['https://app.compl-ai.co.uk/logo.png'],
    creator: '@ComplAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://app.compl-ai.co.uk',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          poppins.className,
          'font-sans antialiased min-h-screen bg-background text-foreground'
        )}
        suppressHydrationWarning
      >
        <SkipToContent />
        <AppProviders>
          <main id="main-content" className="flex min-h-screen flex-col">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
