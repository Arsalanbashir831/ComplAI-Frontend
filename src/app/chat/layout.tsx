'use client';

import { ChatSidebar } from '@/components/chat/chat-sidebar';

/**
 * Chat Layout
 *
 * Provides the layout structure for all chat-related pages.
 * Includes the sidebar navigation.
 *
 * Note: Authority and chat state are now managed by Zustand stores (no providers needed)
 */
export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
