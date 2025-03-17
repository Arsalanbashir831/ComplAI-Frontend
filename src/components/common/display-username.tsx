'use client';

import { useUserContext } from '@/contexts/user-context';

export default function DisplayUsername() {
  const { user } = useUserContext();
  return (
    <span className="truncate w-[200px] overflow-hidden text-ellipsis" title={user?.username ?? 'User'}>
      {user?.username  ?? 'User'}
    </span>
  );
}
