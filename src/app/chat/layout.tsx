'use client';

import { SendMessageTriggerProvider } from '@/contexts/send-message-trigger-context';

import { ChatSidebar } from '@/components/chat/chat-sidebar';

/**
 * Chat Layout
 *
 * Provides the layout structure for all chat-related pages.
 * Includes the sidebar navigation and message trigger context.
 *
 * Note: Authority state is now managed by Zustand store (no provider needed)
 */
export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar />
      <SendMessageTriggerProvider>
        <main className="flex-1 overflow-auto">{children}</main>
      </SendMessageTriggerProvider>
    </div>
  );
}
