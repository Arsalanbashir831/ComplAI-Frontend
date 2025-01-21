import { AuthSlider } from '@/components/auth/AuthSlider';
import { Logo } from '@/components/common/logo';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[#F8F8FF]">
      <div className="basis-1/2 px-8 py-12">
        <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center space-y-8">
          <Logo />
          {children}
        </div>
      </div>
      <div className="basis-1/2 p-8">
        <AuthSlider />
      </div>
    </div>
  );
}
