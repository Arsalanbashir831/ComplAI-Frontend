'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SendMessageTriggerContextProps {
  trigger: boolean;
  setTrigger: (value: boolean) => void;
}

const SendMessageTriggerContext = createContext<
  SendMessageTriggerContextProps | undefined
>(undefined);

export const SendMessageTriggerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [trigger, setTrigger] = useState(false);

  return (
    <SendMessageTriggerContext.Provider value={{ trigger, setTrigger }}>
      {children}
    </SendMessageTriggerContext.Provider>
  );
};

export const useSendMessageTrigger = () => {
  const context = useContext(SendMessageTriggerContext);
  if (context === undefined) {
    throw new Error(
      'useSendMessageTrigger must be used within a SendMessageTriggerProvider'
    );
  }
  return context;
};
