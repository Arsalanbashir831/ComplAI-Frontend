import DashboardHeader from '@/components/dashboard/dashboard-header';
import ProfileForm from '@/components/dashboard/profile-form';

export default function ProfilePage() {
  return (
    <div className="p-6 flex flex-col gap-y-16 bg-[#F9F9FC]">
      <DashboardHeader title="My Profile" badgeTitle="18 Total" />

      <ProfileForm />
    </div>
  );
}
