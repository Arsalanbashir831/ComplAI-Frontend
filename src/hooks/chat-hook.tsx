'use client';

import React, { createContext, useContext, useState } from 'react';

import { Chat, ChatMessage } from '@/types/chat';

interface ChatContextProps {
  chats: Record<string, Chat>;
  currentChatId: string | null;
  setCurrentChatId: (chatId: string) => void;
  addMessageToChat: (chatId: string, message: ChatMessage) => void;
  createNewChat: () => string;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const createNewChat = (): string => {
    const newChatId = crypto.randomUUID();
    setChats((prev) => ({
      ...prev,
      [newChatId]: { id: newChatId, messages: [] },
    }));
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const addMessageToChat = (chatId: string, message: ChatMessage) => {
    setChats((prev) => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        messages: [...(prev[chatId]?.messages || []), message],
      },
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        setCurrentChatId,
        addMessageToChat,
        createNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
