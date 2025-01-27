import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export default function DashboardHeader({
  title,
  badgeTitle,
}: {
  title: string;
  badgeTitle?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center gap-5 ml-4 md:ml-0">
        <h1 className="text-xl md:text-3xl font-bold">{title}</h1>
        {badgeTitle && (
          <Badge
            variant="outline"
            className="text-[#625AE7] bg-[#EEF2FE] text-xs md:text-sm shadow-none border-none"
          >
            {badgeTitle}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>JW</AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col">
          <p className="text-sm font-medium">John William</p>
          <p className="text-xs text-gray-500">User</p>
        </div>
      </div>
    </div>
  );
}
