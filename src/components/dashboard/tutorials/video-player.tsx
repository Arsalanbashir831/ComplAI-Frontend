'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  Maximize2,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail: string; // Add thumbnail prop
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function VideoPlayer({ videoUrl, thumbnail }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  return (
    <div className="group relative w-full aspect-video rounded-2xl">
      {isLoading && (
        <Image
          // src={thumbnail || '/placeholders/thumbnail.svg'}
          src={'/placeholders/thumbnail.svg'}
          alt="Video thumbnail"
          fill
          className="object-cover rounded-2xl"
        />
      )}
      <video
        ref={videoRef}
        className="w-full h-full"
        onLoadedData={handleLoadedData}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 md:p-4 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="space-y-1 md:space-y-4">
          <div className="w-full">
            <Slider
              defaultValue={[0]}
              max={100}
              step={1}
              className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 md:gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handlePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm">0:00 / 10:00</span>
            </div>
            <div className="flex items-center gap-0 md:gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
