'use client';

import { useState } from 'react';
import { ChevronDown, Filter, SortDesc } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { SearchInput } from '@/components/dashboard/tutorials/search-input';
import { VideoSection } from '@/components/dashboard/tutorials/video-section';

const MOCK_DATA = {
  recommendedVideos: {
    title: 'Recommended Videos',
    subtitle: 'Top picks for You',
    videos: [
      {
        id: '1',
        title: 'VUE JS SCRATCH COURSE',
        studio: 'Kitani Studio',
        description:
          'More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...',
        thumbnail: '/placeholders/tutorial-1.svg',
        tags: ['vue', 'javascript'],
      },
      {
        id: '2',
        title: 'UI DESIGN FOR BEGINNERS',
        studio: 'Kitani Studio',
        description:
          'More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...',
        thumbnail: '/placeholders/tutorial-2.svg',
        tags: ['design', 'ui'],
      },
      {
        id: '3',
        title: 'UI DESIGN FOR BEGINNERS',
        studio: 'Kitani Studio',
        description:
          'More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...',
        thumbnail: '/placeholders/tutorial-3.svg',
        tags: ['design', 'ui'],
      },
      {
        id: '4',
        title: 'UI DESIGN FOR BEGINNERS',
        studio: 'Kitani Studio',
        description:
          'More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...',
        thumbnail: '/placeholders/tutorial-1.svg',
        tags: ['design', 'ui'],
      },
      {
        id: '5',
        title: 'UI DESIGN FOR BEGINNERS',
        studio: 'Kitani Studio',
        description:
          'More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...',
        thumbnail: '/placeholders/tutorial-1.svg',
        tags: ['design', 'ui'],
      },
    ],
  },
  recommendedTutorials: {
    title: 'Recommended Tutorials',
    subtitle: 'Top picks for You',
    videos: [
      {
        id: '3',
        title: 'MOBILE DEV REACT NATIVE',
        studio: 'Kitani Studio',
        description:
          'More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...',
        thumbnail: '/placeholders/tutorial-1.svg',
        tags: ['react', 'mobile'],
      },
      {
        id: '4',
        title: 'WEBSITE DEV ZERO TO HERO',
        studio: 'Kitani Studio',
        description:
          'More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator Now...',
        thumbnail: '/placeholders/tutorial-2.svg',
        tags: ['web', 'development'],
      },
      // Add more tutorials as needed
    ],
  },
};

export default function TutorialsPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="p-6 flex flex-col gap-y-8">
      <DashboardHeader title="Subscription" />

      <div className="px-6 py-10 bg-white shadow-md rounded-xl w-full mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            // className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
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
          </div>
        </div>

        <VideoSection section={MOCK_DATA.recommendedVideos} />
        <Separator />
        <VideoSection section={MOCK_DATA.recommendedTutorials} />
      </div>
    </div>
  );
}
