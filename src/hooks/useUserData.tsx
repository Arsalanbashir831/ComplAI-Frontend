import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';

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
  return useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: fetchUserData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false, // Prevent auto-refetch on window focus
  });
};

export default useUserData;
