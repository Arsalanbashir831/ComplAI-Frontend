'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { VideoSection } from '@/types/video';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/dashboard/tutorials/video-card';

export function VideoSection({ title, subtitle, videos }: VideoSection) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 285 + 16; // Card width (285px) + gap (16px)
    const currentScroll = container.scrollLeft;
    const newScroll =
      direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-[#1B1B1B99]">{subtitle}</p>
      </div>

      <div className="group relative">
        {/* Fixed height container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth w-full h-[285px]"
        >
          {videos && videos.length > 0 ? (
            <div className="flex gap-4 min-w-max">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-xl">
              No videos found
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full md:opacity-0 transition group-hover:opacity-100 bg-blue-dark text-white border-none hover:bg-blue-dark hover:text-white"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full md:opacity-0 transition group-hover:opacity-100 bg-blue-dark text-white border-none hover:bg-blue-dark hover:text-white"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
