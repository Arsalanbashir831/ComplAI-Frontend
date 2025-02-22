import { ChatSidebar } from '@/components/chat/chat-sidebar';

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
