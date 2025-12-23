'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { FileText, LayoutDashboard, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Logo } from '../common/logo';
import LogoutButton from '../common/logout-button';
import MenuToggleButton from '../common/menu-toggle-button';

// Types for resolver complaints
export interface ResolverComplaint {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'text';
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

// Dummy data for development
const DUMMY_COMPLAINTS: ResolverComplaint[] = [
  {
    id: '1',
    title: 'Document Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'document',
    status: 'pending',
    created_at: '2024-12-17T10:00:00Z',
    updated_at: '2024-12-17T10:00:00Z',
  },
  {
    id: '2',
    title: 'Text Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'text',
    status: 'in_progress',
    created_at: '2024-12-16T14:30:00Z',
    updated_at: '2024-12-17T09:15:00Z',
  },
  {
    id: '3',
    title: 'Document Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'document',
    status: 'resolved',
    created_at: '2024-12-15T09:00:00Z',
    updated_at: '2024-12-16T16:45:00Z',
  },
  {
    id: '4',
    title: 'Text Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'text',
    status: 'pending',
    created_at: '2024-12-14T11:20:00Z',
    updated_at: '2024-12-14T11:20:00Z',
  },
  {
    id: '5',
    title: 'Text Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'text',
    status: 'in_progress',
    created_at: '2024-12-13T16:00:00Z',
    updated_at: '2024-12-17T08:00:00Z',
  },
  {
    id: '6',
    title: 'Text Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'text',
    status: 'in_progress',
    created_at: '2024-12-13T16:00:00Z',
    updated_at: '2024-12-17T07:00:00Z',
  },
  {
    id: '7',
    title: 'Text Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'text',
    status: 'in_progress',
    created_at: '2024-12-13T16:00:00Z',
    updated_at: '2024-12-17T06:00:00Z',
  },
  {
    id: '8',
    title: 'Text Complaint',
    description:
      'recently requested a copy of your data retention policy and was surprised...',
    type: 'text',
    status: 'in_progress',
    created_at: '2024-12-13T16:00:00Z',
    updated_at: '2024-12-17T05:00:00Z',
  },
];

export function ResolverSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const pathname = usePathname();
  const currentComplaintId = pathname.split('/').pop();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Filter and sort complaints
  const filteredComplaints = useMemo(() => {
    const filtered = DUMMY_COMPLAINTS.filter((complaint) =>
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by updated_at descending (most recent first)
    return filtered.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [searchTerm]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full w-[280px] flex-col bg-[#F5F8FF] lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out border-r border-[#E5E9F0]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Toggle Button for Mobile */}
        <MenuToggleButton isOpen={isOpen} toggleSidebar={toggleSidebar} />

        {/* Header with Logo */}
        <div className="py-6 px-4">
          <div className="pb-6">
            <Logo href={ROUTES.LANDINGPAGE} />
          </div>

          <div className="text-xl font-medium text-[#04338B] mb-4">
            Recent Complaints
          </div>

          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search for complaint"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search className="h-4 w-4 text-[#73726D]" />}
              className="pl-10 h-10 bg-white rounded-xl border border-[#BABABA] text-sm placeholder:text-[#73726D]"
            />
          </div>
        </div>

        {/* Complaints List */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 pb-6">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => {
                const isActive = currentComplaintId === complaint.id;
                return (
                  <Link
                    key={complaint.id}
                    href={`/resolver/${complaint.id}`}
                    className="block"
                  >
                    <div
                      className={cn(
                        'w-full rounded-2xl p-4 transition-all flex flex-col gap-3',
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-white text-[#04338B] hover:bg-white/80'
                      )}
                    >
                      {/* Badge */}
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1 rounded-full w-fit',
                          isActive
                            ? 'text-white border border-[#D1E1FF]'
                            : 'bg-[#F5F8FF] text-[#04338B] border border-[#D1E1FF]'
                        )}
                      >
                        <FileText className="h-3 w-3" />
                        <span className="text-sm font-semibold whitespace-nowrap">
                          {complaint.type === 'document'
                            ? 'Document Complaint'
                            : 'Text Complaint'}
                        </span>
                      </div>

                      {/* Description */}
                      <p
                        className={cn(
                          'text-base leading-snug line-clamp-2',
                          isActive ? 'text-white/80' : 'text-[#626262]'
                        )}
                      >
                        {complaint.description}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center text-[#626262] py-4 text-sm font-light">
                No complaints found
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Navigation */}
        <div className="px-6 py-4">
          <div className="border-t pt-4">
            <Link
              href={ROUTES.DASHBOARD}
              className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-gray-light transition-colors font-medium gap-2 text-sm text-gray-dark hover:text-blue-dark"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <LogoutButton className="text-gray-dark hover:text-blue-dark" />
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}
