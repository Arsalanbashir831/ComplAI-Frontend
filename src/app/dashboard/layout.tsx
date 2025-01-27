import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto bg-[#F9F9FC]">{children}</main>
    </div>
  );
}
