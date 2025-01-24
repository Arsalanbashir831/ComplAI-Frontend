import DashboardHeader from '@/components/dashboard/dashboard-header';
import ProfileForm from '@/components/dashboard/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="p-6 flex flex-col gap-y-16">
      <DashboardHeader title="My Profile" badgeTitle="18 Total" />

      <ProfileForm />
    </div>
  );
}
