import Image from 'next/image';
import { Play, User } from 'lucide-react';

import type { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="w-[285px] flex-shrink-0 overflow-hidden border-none">
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail || '/placeholder.svg'}
          alt={video.title}
          fill
          className="object-cover"
        />
        <Button
          variant="ghost"
          className="bg-[#F8F9FF] absolute -bottom-4 right-4 p-2 rounded-full shadow-md"
        >
          <Play className="h-4 w-4 text-primary" />
        </Button>
      </div>
      <CardContent className="p-4 px-0">
        <h3 className="font-bold line-clamp-1">{video.title}</h3>
        <p className="text-sm flex items-center gap-1">
          <User className="h-4 w-4 inline-block" />
          <span className="text-blue-dark">{video.studio}</span>
        </p>
        <p className="mt-2 text-sm line-clamp-3 text-gray-dark">
          {video.description}
        </p>
      </CardContent>
    </Card>
  );
}
