'use client';

import { ROUTES } from '@/constants/routes';
import { FileText, LayoutDashboard, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResolver } from '@/hooks/useResolver';
import { cn } from '@/lib/utils';

import { Logo } from '../common/logo';
import LogoutButton from '../common/logout-button';
import MenuToggleButton from '../common/menu-toggle-button';

export function ResolverSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const pathname = usePathname();
  const currentComplaintId = pathname.split('/').pop();

  const { useComplaintsList } = useResolver();
  const { data: complaintsData } = useComplaintsList();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Filter and sort complaints
  const filteredComplaints = useMemo(() => {
    const complaints = complaintsData?.results || [];
    const filtered = complaints.filter((complaint) =>
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by updated_at descending (most recent first)
    return filtered.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [complaintsData, searchTerm]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full w-[370px] flex-col bg-[#F5F8FF] lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out border-r border-[#E5E9F0]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Toggle Button for Mobile */}
        <MenuToggleButton isOpen={isOpen} toggleSidebar={toggleSidebar} />

        {/* Header with Logo */}
        <div className="py-6 px-4">
          <div className="pb-6">
            <Logo href={ROUTES.LANDINGPAGE} className="justify-start" />
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
                        <span className="text-sm font-semibold whitespace-nowrap capitalize">
                          {complaint.status} Complaint
                        </span>
                      </div>

                      {/* Subject */}
                      <h3
                        className={cn(
                          'text-sm font-semibold line-clamp-1',
                          isActive ? 'text-white' : 'text-[#04338B]'
                        )}
                      >
                        {complaint.subject}
                      </h3>

                      {/* Description */}
                      <p
                        className={cn(
                          'text-xs leading-snug line-clamp-2',
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
