'use client';

import type { VideoSection } from '@/types/video';
import { VideoCard } from '@/components/dashboard/tutorials/video-card';

export function VideoSection({ title, subtitle, videos }: VideoSection) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-left">{title}</h2>
        <p className="text-[#1B1B1B99] text-left">{subtitle}</p>
      </div>

      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-xl">
          <p className="text-gray-500">No videos found</p>
        </div>
      )}
    </div>
  );
}
