'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { FileText, LayoutDashboard, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Logo } from '../common/logo';
import LogoutButton from '../common/logout-button';
import MenuToggleButton from '../common/menu-toggle-button';

// Types for resolver complaints
export interface ResolverComplaint {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

// Dummy data for development
const DUMMY_COMPLAINTS: ResolverComplaint[] = [
  {
    id: '1',
    title: 'Client complaint about billing discrepancy',
    status: 'pending',
    created_at: '2024-12-17T10:00:00Z',
    updated_at: '2024-12-17T10:00:00Z',
  },
  {
    id: '2',
    title: 'Service delay investigation request',
    status: 'in_progress',
    created_at: '2024-12-16T14:30:00Z',
    updated_at: '2024-12-17T09:15:00Z',
  },
  {
    id: '3',
    title: 'Contract terms clarification needed',
    status: 'resolved',
    created_at: '2024-12-15T09:00:00Z',
    updated_at: '2024-12-16T16:45:00Z',
  },
  {
    id: '4',
    title: 'Missing documentation follow-up',
    status: 'pending',
    created_at: '2024-12-14T11:20:00Z',
    updated_at: '2024-12-14T11:20:00Z',
  },
  {
    id: '5',
    title: 'Fee structure dispute resolution',
    status: 'in_progress',
    created_at: '2024-12-13T16:00:00Z',
    updated_at: '2024-12-17T08:00:00Z',
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
          'fixed inset-y-0 left-0 z-40 flex h-full w-[280px] flex-col bg-blue-light lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Toggle Button for Mobile */}
        <MenuToggleButton isOpen={isOpen} toggleSidebar={toggleSidebar} />

        {/* Header with Logo */}
        <div className="p-6">
          <div className="mb-8 border-b border-gray-dark pb-6">
            <Logo href={ROUTES.LANDINGPAGE} />
          </div>

          {/* Search Input */}
          <Input
            placeholder="Search for complaints"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="pl-8"
          />
        </div>

        {/* Complaints List */}
        <div className="flex-1 overflow-auto px-6">
          <h2 className="mb-4 text-lg font-semibold">
            {searchTerm ? 'Search Results' : 'Complaints'}
          </h2>

          <div className="space-y-2">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  href={`/resolver/${complaint.id}`}
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start text-left font-normal text-gray-dark h-auto py-3 px-3',
                      currentComplaintId === complaint.id &&
                        'bg-accent text-black'
                    )}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm truncate">
                          {complaint.title}
                        </span>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No complaints found
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 pb-4">
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
