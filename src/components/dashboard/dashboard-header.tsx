import { ROUTES } from '@/constants/routes';
import Link from 'next/link';

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
  return (
    <div className="flex items-start justify-between w-full ">
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
        <Link href={ROUTES.PROFILE} className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JW</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <p className="text-sm font-medium">John William</p>
            <p className="text-xs text-gray-500">User</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
