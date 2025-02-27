import { UploadedFile } from './upload';

export interface PromptCard {
  id: string;
  icon: React.ReactNode;
  title: string;
}

export interface ChatLayoutProps {
  children: React.ReactNode;
}

export interface PromptCardProps extends PromptCard {
  className?: string;
}

export interface ChatMessage {
  id: number;
  chat: number;
  user: string | null;
  content: string;
  created_at: string;
  is_system_message: boolean;
  file: UploadedFile | File | null;
  userName?: string;
  avatarUrl?: string;

  tokens_used:number;
}

export interface Chat {
  id: string;
  name: string;
  user: string;
  createdAt: string;
  updatedAt: string;
 
}

export interface ChatState {
  chats: Record<string, Chat>;
  currentChatId: string | null;
}
