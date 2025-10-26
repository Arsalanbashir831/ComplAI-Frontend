'use client';

import { AuthorityProvider } from '@/contexts/authority-context';
import { SendMessageTriggerProvider } from '@/contexts/send-message-trigger-context';

import { ChatSidebar } from '@/components/chat/chat-sidebar';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar />
      <AuthorityProvider>
        <SendMessageTriggerProvider>
          <main className="flex-1 overflow-auto">{children}</main>
        </SendMessageTriggerProvider>
      </AuthorityProvider>
    </div>
  );
}
