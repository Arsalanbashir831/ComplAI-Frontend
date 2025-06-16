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
  id: number | string;
  chat: number;
  user: string | null;
  content: string;
  created_at: string;
  is_system_message: boolean;
  files: UploadedFile | File | null | File[] | [];
  userName?: string;
  avatarUrl?: string;

  tokens_used: number;
}

export interface Chat {
  updated_at: string | number | Date;
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
