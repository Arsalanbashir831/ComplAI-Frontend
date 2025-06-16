// ChatContext.tsx
'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

import type { ChatMessage } from '@/types/chat';

interface ChatContextProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  focusMessageId: number | string | null;
  setFocusMessageId: (id: number | string | null) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [focusMessageId, setFocusMessageId] = useState<number | string | null>(
    null
  );

  return (
    <ChatContext.Provider
      value={{ messages, setMessages, focusMessageId, setFocusMessageId }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
