import { UserProvider } from '@/contexts/user-context';
import AuthProvider from '@/provider/AuthProvider';
import QueryProvider from '@/provider/QueryClientProvider';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import { LoaderProvider } from '@/contexts/loader-context';
import './globals.css';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Compl-AI',
  description: 'Compl-AI is a compliance assistant for family offices.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans bg-background text-foreground ${poppins}`}>
        <QueryProvider>
          <AuthProvider>
            <LoaderProvider>
            <UserProvider>{children}</UserProvider>
            </LoaderProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
