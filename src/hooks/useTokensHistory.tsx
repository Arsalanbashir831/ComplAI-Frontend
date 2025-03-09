import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';

import { ActivityItem } from '@/types/dashboard';
import apiCaller from '@/config/apiCaller';

const fetchHistory = async (dateRange: DateRange): Promise<ActivityItem> => {
  if (!dateRange?.from || !dateRange?.to)
    return {
      id: 0,
      usage_date: '',
      activity_type: '',
      tokens_used: 0,
      user_id: 0,
      ai_message: {
        id: 0,
        chat: 0,
        content: '',
        created_at: '',
        file: '',
        file_size: 0,
        is_system_message: false,
        user: '',
      },
      user_message: {
        id: 0,
        chat: 0,
        content: '',
        created_at: '',
        file: '',
        file_size: 0,
        is_system_message: false,
        user: '',
      },
    };

  const queryParams = `?start_date=${
    dateRange.from.toISOString().split('T')[0]
  }&end_date=${dateRange.to.toISOString().split('T')[0]}`;

  const response = await apiCaller(
    `${API_ROUTES.CHAT.GET_INTERACTION_HISTORY}${queryParams}`,
    'GET',
    {},
    {},
    true,
    'json'
  );
  console.log(response);
  return response.data.map((item: ActivityItem) => ({
    ...item,
    activity_type: item?.user_message?.file ? 'Uploaded Document' : 'query',
  }));
};

const useTokensHistory = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['history', dateRange],
    queryFn: () => fetchHistory(dateRange),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
};

export default useTokensHistory;
