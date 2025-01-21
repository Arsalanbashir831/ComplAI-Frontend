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
