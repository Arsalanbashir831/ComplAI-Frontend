export interface MetricCard {
  title: string;
  value: number;
  type: 'total' | 'used' | 'remaining';
}

export interface ActivityItem {
  serialNo: number;
  requestedAt: string;
  activityType: string;
  tokensDeducted: number;
}

export interface TokenUsageTrend {
  date: string;
  value: number;
}
