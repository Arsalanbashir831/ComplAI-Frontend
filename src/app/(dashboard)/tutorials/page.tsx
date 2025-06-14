'use client';

import { useMemo, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';

import { Video } from '@/types/video';
import apiCaller from '@/config/apiCaller';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { SearchInput } from '@/components/dashboard/tutorials/search-input';
import { VideoSection } from '@/components/dashboard/tutorials/video-section';

const fetchVideos = async (): Promise<Video[]> => {
  const response = await apiCaller(
    API_ROUTES.TUTORIALS.GET,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
};

export default function TutorialsPage() {
  const [search, setSearch] = useState('');

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: fetchVideos,
    staleTime: 1000 * 60 * 5,
  });

  // Trim and lowercase the search query for case-insensitive matching
  const searchQuery = search.trim().toLowerCase();

  // Use memoization to prevent unnecessary recalculations on every render
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesType = video.video_type === 'video';
      const titleMatches = video.title.toLowerCase().includes(searchQuery);
      const descriptionMatches =
        video.description &&
        video.description.toLowerCase().includes(searchQuery);
      return matchesType && (titleMatches || descriptionMatches);
    });
  }, [videos, searchQuery]);

  const filteredTutorials = useMemo(() => {
    return videos.filter((video) => {
      const matchesType = video.video_type === 'tutorial';
      const titleMatches = video.title.toLowerCase().includes(searchQuery);
      const descriptionMatches =
        video.description &&
        video.description.toLowerCase().includes(searchQuery);
      return matchesType && (titleMatches || descriptionMatches);
    });
  }, [videos, searchQuery]);

  if (isLoading) {
    return (
      <div className="animate-pulse min-h-screen flex flex-col items-center px-6 py-8">
        <DashboardHeader
          title="Tutorials and Guides"
          subtitle="Your Path to Mastering Compl-AI"
        />

        <div className="flex flex-col justify-center flex-1 w-full bg-white shadow-md rounded-xl p-8 space-y-8 mt-3">
          {/* Search Input Skeleton */}
          <div className="h-10 w-full md:w-1/3 bg-gray-200 rounded" />

          {/* Recommended Videos Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-40 bg-gray-200 rounded-lg" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Recommended Tutorials Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-40 bg-gray-200 rounded-lg" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      <DashboardHeader
        title="Tutorials and Guides"
        subtitle="Your Path to Mastering Compl-AI"
      />

      <div className="flex flex-col justify-center flex-1 w-full bg-white shadow-md rounded-xl p-8 space-y-8 mt-3">
        {/* Search Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <SearchInput value={search} onChange={setSearch} />
        </div>

        <VideoSection
          title="Recommended Videos"
          subtitle="Top picks for You"
          videos={filteredVideos}
        />
        <Separator />
        <VideoSection
          title="Recommended Tutorials"
          subtitle="Top picks for You"
          videos={filteredTutorials}
        />
      </div>
    </div>
  );
}
