export interface MetricCard {
  title: string;
  value: number;
  type: 'total' | 'used' | 'remaining';
}

export interface ActivityItem {
  id: number;
  usage_date: string;
  activityType: string;
  tokens_used: number;
  description: string;
  ai_response_document: string;
  query: string;
  user_id: string;
}

export interface TokenUsageTrend {
  date: string;
  value: number;
}
