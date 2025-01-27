'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Maximize2,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import ReactPlayer from 'react-player';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string; // Optional thumbnail
}

export function VideoPlayer({ videoUrl, thumbnail }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Range: 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isExternalVideo, setIsExternalVideo] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if the video is external (e.g., YouTube)
  useEffect(() => {
    const isExternal = ReactPlayer.canPlay(videoUrl);
    setIsExternalVideo(isExternal);
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (isExternalVideo && playerRef.current) {
      const internalPlayer = playerRef.current.getInternalPlayer();
      if (isPlaying) {
        if (internalPlayer.pauseVideo) {
          internalPlayer.pauseVideo(); // YouTube API
        }
      } else {
        if (internalPlayer.playVideo) {
          internalPlayer.playVideo(); // YouTube API
        }
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoaded = () => {
    setIsReady(true);
    if (!isExternalVideo && videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (isExternalVideo && playerRef.current) {
      setCurrentTime(playerRef.current.getCurrentTime() || 0);
    } else if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (isExternalVideo && playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime() || 0;
      playerRef.current.seekTo(currentTime + seconds, 'seconds');
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        Math.max(videoRef.current.currentTime + seconds, 0),
        duration
      );
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 1); // Toggle mute/unmute
  };

  return (
    <div
      ref={containerRef}
      className="group relative w-full aspect-video rounded-2xl"
    >
      {!isReady && (
        <Image
          src={thumbnail || '/placeholders/thumbnail.svg'}
          alt="Video thumbnail"
          fill
          className="object-cover rounded-2xl"
        />
      )}

      {isExternalVideo ? (
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={isPlaying}
          volume={volume}
          onReady={handleLoaded}
          onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
          onDuration={(dur) => setDuration(dur)}
          width="100%"
          height="100%"
          controls={false} // Hide default controls
          className={`rounded-2xl`}
        />
      ) : (
        <video
          ref={videoRef}
          className={`w-full h-full rounded-2xl`}
          onLoadedData={handleLoaded}
          onTimeUpdate={handleTimeUpdate}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Custom Controls */}
      {isReady && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 md:px-4 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1">
          {/* Progress Slider */}
          <div className="w-full">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={(value) => {
                if (isExternalVideo && playerRef.current) {
                  playerRef.current.seekTo(value[0], 'seconds');
                } else if (videoRef.current) {
                  videoRef.current.currentTime = value[0];
                }
              }}
              className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-0 md:gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => handleSkip(-10)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handlePlayPause}
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
                onClick={() => handleSkip(10)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-0 md:gap-2">
              <div className="relative group/volume">
                {/* Volume Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>

                {/* Volume Slider */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/volume:opacity-100 transition-opacity duration-300">
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(value) => setVolume(value[0] / 100)}
                    orientation="vertical"
                    className="h-24 w-1 bg-primary rounded-lg flex items-center justify-center"
                  />
                </div>
              </div>
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Playback Speed</DropdownMenuItem>
                  <DropdownMenuItem>Quality</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleFullscreen}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
