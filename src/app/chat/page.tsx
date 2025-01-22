import { RecentChat } from '@/types/chat';
import NewChat from '@/components/chat/new-chat';
import { Sidebar } from '@/components/chat/sidebar';

const recentChats: RecentChat[] = [
  { id: '1', message: 'I need a quick guide in...' },
  { id: '2', message: 'I need a quick guide in...' },
  { id: '3', message: 'I need a quick guide in...' },
  { id: '4', message: 'I need a quick guide in...' },
  { id: '5', message: 'I need a quick guide in...' },
  { id: '6', message: 'I need a quick guide in...' },
];

export default function Page() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="p-4">
        <Sidebar recentChats={recentChats} />
      </div>
      <main className="flex-1 overflow-auto">
        <NewChat />
      </main>
    </div>
  );
}
