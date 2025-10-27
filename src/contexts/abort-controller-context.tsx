'use client';

import React, { createContext, ReactNode, useContext, useRef } from 'react';

interface AbortControllerContextType {
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  abortCurrentRequest: () => void;
}

const AbortControllerContext = createContext<
  AbortControllerContextType | undefined
>(undefined);

export function AbortControllerProvider({ children }: { children: ReactNode }) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortCurrentRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <AbortControllerContext.Provider
      value={{ abortControllerRef, abortCurrentRequest }}
    >
      {children}
    </AbortControllerContext.Provider>
  );
}

export function useAbortController() {
  const context = useContext(AbortControllerContext);
  if (context === undefined) {
    throw new Error(
      'useAbortController must be used within an AbortControllerProvider'
    );
  }
  return context;
}
