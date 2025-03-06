'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Download, Play, User } from 'lucide-react';

import type { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { VideoPlayer } from './video-player';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card
        className="w-[285px] flex-shrink-0 overflow-hidden border-none cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative aspect-video">
          <Image
            src={video.thumbnail_url ?? '/placeholders/thumbnail.svg'}
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

          <div className="flex items-center  gap-3 mt-2">
            <p className="text-sm flex items-center gap-1">
              <User className="h-4 w-4 inline-block" />
              <span className="text-blue-dark">{video.studio}</span>
            </p>
            <Button
              variant="destructive"
              className="text-[10px] p-1 !no-underline h-fit"
            >
              <Download className="!h-3.5 !w-3.5 inline-block" />
              PDF
            </Button>
          </div>

          <p className="mt-2 text-sm line-clamp-3 text-gray-dark">
            {video.description}
          </p>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTitle hidden={true} className="text-2xl font-bold">
          {video.title}
        </DialogTitle>
        <DialogContent
          className="max-w-sm md:max-w-3xl p-2 md:p-0 bg-transparent border-none group"
          closeButtonClass="bg-white rounded-full p-1 opacity-0 group-hover:opacity-100"
          aria-describedby="video-description"
        >
          <VideoPlayer
            videoUrl={video.video_url}
            thumbnail={video.thumbnail_url ?? '/placeholders/thumbnail.svg'}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
