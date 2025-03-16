'use client';

import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

interface PromptContextProps {
  promptText: string;
  setPromptText: Dispatch<SetStateAction<string>>;
}

const PromptContext = createContext<PromptContextProps | undefined>(undefined);

export const PromptProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [promptText, setPromptText] = useState<string>('');

  return (
    <PromptContext.Provider value={{ promptText, setPromptText }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = (): PromptContextProps => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};
