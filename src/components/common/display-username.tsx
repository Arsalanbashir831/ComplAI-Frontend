'use client';

import { useUserContext } from '@/contexts/user-context';

export default function DisplayUsername() {
  const { user } = useUserContext();
  return <span>{user?.username ?? 'User'}</span>;
}
