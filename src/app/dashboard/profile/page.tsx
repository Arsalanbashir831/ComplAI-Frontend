import DashboardHeader from '@/components/dashboard/dashboard-header';
import ProfileForm from '@/components/dashboard/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="p-6 flex flex-col gap-y-8">
      <DashboardHeader title="My Profile" />

      <ProfileForm />
    </div>
  );
}
