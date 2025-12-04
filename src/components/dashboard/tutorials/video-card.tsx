'use client';

import { DialogTitle } from '@radix-ui/react-dialog';
import { Download, Play, User } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Video } from '@/types/video';

import { VideoPlayer } from './video-player';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card
        className="w-full overflow-hidden border-none cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-full h-64 group">
          <Image
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.compl-ai.co.uk'}/${video.thumbnail_image}`}
            alt={video.title}
            fill
            className="object-cover"
          />
          {/* Overlay for better play button visibility */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          
          {/* Centered play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              className="bg-white/90 hover:bg-white p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform"
            >
              <Play className="h-6 w-6 text-primary fill-primary" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg line-clamp-2 mb-2">
            {video.title}
          </h3>

          <div className="flex items-center gap-3 mb-3">
            <p className="text-sm flex items-center gap-1">
              <User className="h-4 w-4 inline-block" />
              <span className="text-blue-dark">{video.studio}</span>
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevents the card's onClick from firing
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
                // If the pdf_file already starts with http, use it directly; otherwise, prepend the base URL.
                const pdfUrl = video.pdf_file.startsWith('http')
                  ? video.pdf_file
                  : `${baseUrl}${video.pdf_file}`;
                window.open(pdfUrl, '_blank');
              }}
              variant="destructive"
              className="text-xs px-2 py-1 !no-underline h-fit"
            >
              <Download className="h-3.5 w-3.5 inline-block mr-1" />
              PDF
            </Button>
          </div>

          <p className="text-sm line-clamp-3 text-gray-dark">
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
            thumbnail={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.thumbnail_image}`}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
