import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { ChatProvider } from '@/contexts/chat-context';
import { LoaderProvider } from '@/contexts/loader-context';
import { PromptProvider } from '@/contexts/prompt-context';
import { UserProvider } from '@/contexts/user-context';
import AuthProvider from '@/provider/AuthProvider';
import QueryProvider from '@/provider/QueryClientProvider';

import { Toaster } from '@/components/ui/sonner';

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
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
  return (
    <html lang="en">
      <body className={`font-sans bg-background text-foreground ${poppins}`}>
        <ChatProvider>
          <PromptProvider>
            <QueryProvider>
              <AuthProvider>
                <LoaderProvider>
                  <UserProvider>{children}</UserProvider>
                  <Toaster richColors />
                </LoaderProvider>
              </AuthProvider>
            </QueryProvider>
          </PromptProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
