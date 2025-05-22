export interface MetricCard {
  title: string;
  value: number;
  type: 'total' | 'used' | 'remaining';
}

export interface ActivityItem {
  id: number;
  usage_date: string;
  activity_type: string;
  tokens_used: number;
  user_id: number;
  tool:string;

  ai_message: {
    id: number;
    chat: number;
    content: string;
    created_at: string;
    file: string | null;
    file_size: number | null;
    is_system_message: boolean;
    user: string | null;
  };

  user_message: {
    id: number;
    chat: number;
    content: string;
    created_at: string;
    file: string | null;
    file_size: number | null;
    is_system_message: boolean;
    user: string;
  };
}

export interface TokenUsageTrend {
  date: string;
  value: number;
}
