import { API_ROUTES } from '@/constants/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';

import apiCaller from '@/config/apiCaller';
import { ActivityItem } from '@/types/dashboard';

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
    `${API_ROUTES.CHAT.GET_INTERACTION_HISTORY}${queryParams}`,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data.map((item: ActivityItem) => ({
    ...item,
    activity_type:
      item.activity_type.includes('.docx') ||
      item.activity_type.includes('.pdf')
        ? 'document'
        : item.activity_type,
    ai_response_document:
      item.activity_type.includes('.docx') ||
      item.activity_type.includes('.pdf')
        ? item.activity_type
        : null,
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
