import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { SendMessageTriggerProvider } from '@/contexts/send-message-trigger-context';

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
