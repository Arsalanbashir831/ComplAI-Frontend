'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

import { AuthorityValue } from '@/types/chat';

interface AuthorityContextType {
  selectedAuthority: AuthorityValue;
  setSelectedAuthority: (authority: AuthorityValue) => void;
  isAuthorityLocked: boolean;
  setIsAuthorityLocked: (locked: boolean) => void;
}

const AuthorityContext = createContext<AuthorityContextType | undefined>(
  undefined
);

export function AuthorityProvider({ children }: { children: ReactNode }) {
  const [selectedAuthority, setSelectedAuthority] =
    useState<AuthorityValue>('SRA');
  const [isAuthorityLocked, setIsAuthorityLocked] = useState(false);

  return (
    <AuthorityContext.Provider
      value={{
        selectedAuthority,
        setSelectedAuthority,
        isAuthorityLocked,
        setIsAuthorityLocked,
      }}
    >
      {children}
    </AuthorityContext.Provider>
  );
}

export function useAuthority() {
  const context = useContext(AuthorityContext);
  if (context === undefined) {
    throw new Error('useAuthority must be used within an AuthorityProvider');
  }
  return context;
}
