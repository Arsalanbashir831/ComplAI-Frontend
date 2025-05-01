// contexts/chat-context.tsx
'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface ChatContextProps {
  /** Array of rendered chat bubble components */
  bubbles: ReactNode[];
  setBubbles: React.Dispatch<React.SetStateAction<ReactNode[]>>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [bubbles, setBubbles] = useState<ReactNode[]>([]);
  return (
    <ChatContext.Provider value={{ bubbles, setBubbles }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
};