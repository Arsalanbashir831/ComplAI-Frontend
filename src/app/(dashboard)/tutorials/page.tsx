'use client';

import { useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';

import { Video } from '@/types/video';
import apiCaller from '@/config/apiCaller';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/common/loading-spinner';
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      {/* Dashboard Header - Stays at the Top */}
      <DashboardHeader
        title="Tutorials and Guides"
        subtitle="Your Path to Mastering Compl-AI"
      />

      {/* Content Section - Centered */}
      <div className="flex flex-col justify-center flex-1 w-full  bg-white shadow-md rounded-xl p-8 space-y-8 mt-3">
        {/* Search & Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <SearchInput value={search} onChange={setSearch} />

          {/* <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E0E4EE] text-[#596375] px-4 py-5 rounded-xl"
            >
              Filter
              <Filter className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#E0E4EE] text-[#596375] px-4 py-5 rounded-xl"
            >
              <SortDesc className="mr-2 h-4 w-4" />
              Sort by
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div> */}
        </div>

        <VideoSection
          title="Recommended Videos"
          subtitle="Top picks for You"
          videos={videos}
        />
        <Separator />
        <VideoSection
          title="Recommended Tutorials"
          subtitle="Top picks for You"
          videos={videos}
        />
      </div>
    </div>
  );
}
