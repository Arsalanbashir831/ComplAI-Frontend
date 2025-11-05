import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import apiCaller from '@/config/apiCaller';
import { User } from '@/types/user';

const fetchUserData = async (): Promise<User> => {
  const response = await apiCaller(
    API_ROUTES.USER.GET_USER_DATA,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
};

const useUserData = () => {
  const pathname = usePathname();
  const [hasValidToken, setHasValidToken] = useState(false);
  
  // Don't fetch user data on auth pages or if no valid token exists
  const isAuthPage = pathname?.startsWith('/auth') ?? false;
  
  // Check if access token exists (only check, don't validate - validation happens in AuthProvider)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      setHasValidToken(!!accessToken);
    }
  }, [pathname]);
  
  return useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: fetchUserData,
    enabled: !isAuthPage && hasValidToken, // Only fetch if not on auth page AND token exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false, // Prevent auto-refetch on window focus
  });
};

export default useUserData;
