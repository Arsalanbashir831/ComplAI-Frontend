'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@/types/user';
import useUserData from '@/hooks/useUserData';

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refresh: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Destructure refetch from your hook.
  const { data: fetchedUser, isLoading, refetch } = useUserData();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser]);

  return (
    <UserContext.Provider
      value={{ user, loading: isLoading, setUser, refresh: refetch }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
