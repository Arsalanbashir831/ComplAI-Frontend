'use client';

import { ROUTES } from '@/constants/routes';
import { useUserContext } from '@/contexts/user-context';
import Link from 'next/link';
import { useEffect } from 'react';

import { User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export default function DashboardHeader({
  title,
  subtitle,
  badgeTitle,
}: {
  title: string;
  subtitle?: string;
  badgeTitle?: string;
}) {
  const { user, refresh } = useUserContext();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex items-center justify-center gap-5 ml-4 md:ml-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-base text-[#1B1B1B99]">{subtitle}</p>}
        </div>
        {badgeTitle && (
          <Badge
            variant="outline"
            className="text-[#625AE7] bg-[#EEF2FE] text-xs md:text-sm shadow-none border-none"
          >
            {badgeTitle}
          </Badge>
        )}
      </div>
      <div>
        <Link
          href={ROUTES.PROFILE}
          className="flex items-center gap-2 hover:bg-gray-300 p-2 rounded-md transition-all duration-200"
        >
          <Avatar className="w-10 h-10 transition-all duration-200 transform hover:scale-105 bg-gray-100">
            <AvatarImage
              src={user?.profile_picture ?? undefined}
              alt={user?.username || 'User'}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <p className="text-sm font-medium">
              {user?.username || 'Username'}
            </p>
            <p className="text-xs text-gray-500">User</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
