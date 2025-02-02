import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatProvider } from '@/hooks/chat-hook';
import { RecentChat } from '@/types/chat';

const recentChats: RecentChat[] = [
  { id: '1', message: 'I need a quick guide in...' },
  { id: '2', message: 'I need a quick guide in...' },
  { id: '3', message: 'I need a quick guide in...' },
  { id: '4', message: 'I need a quick guide in...' },
  { id: '5', message: 'I need a quick guide in...' },
  { id: '6', message: 'I need a quick guide in...' },
];

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <ChatSidebar recentChats={recentChats} />

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ChatProvider>
  );
}
