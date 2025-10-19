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

export interface Citation {
  sources?: Array<{
    id: string;
    title: string;
    publisher: string;
    url_hint: string;
  }>;
  claims?: Array<{
    id: string;
    text: string;
    supports: string[];
  }>;
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
  citations?: string | Citation;
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
