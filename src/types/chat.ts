import { UploadedFile } from './upload';

export interface RecentChat {
  id: string;
  message: string;
}

export interface PromptCard {
  id: string;
  icon: React.ReactNode;
  title: string;
}

export interface ChatLayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  recentChats: RecentChat[];
}

export interface PromptCardProps extends PromptCard {
  className?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  userName?: string;
  avatarUrl?: string;
  attachments?: UploadedFile[];
}

export interface Chat {
  id: string;
  messages: ChatMessage[];
}

export interface ChatState {
  chats: Record<string, Chat>;
  currentChatId: string | null;
}
