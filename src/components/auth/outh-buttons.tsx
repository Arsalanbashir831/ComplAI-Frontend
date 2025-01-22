import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function OAuthButtons() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    // Handle Google Sign In
    console.log('Google Sign In');
    router.push('/chat');
  };
  return (
    <Button
      variant="outline"
      onClick={handleGoogleSignIn}
      className="w-full justify-center gap-2 border border-[#73726D] py-5 rounded-xl"
    >
      <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
      Continue with Google
    </Button>
  );
}
