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
      description: '',
      user_id: '',
      ai_response_document: '',
      query: '',
    };

  const queryParams = `?start_date=${
    dateRange.from.toISOString().split('T')[0]
  }&end_date=${dateRange.to.toISOString().split('T')[0]}`;

  const response = await apiCaller(
    `${API_ROUTES.USER.GET_TOKENS_HISTORY}${queryParams}`,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
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
