export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  credits_used_today: number;
  total_credits_used: number;
  daily_limit: number;
  is_premium: boolean;
  last_reset_date: string;
  email_verified: boolean;
  reset_cooldown: string | null;
  subscription_type: 'free' | 'premium' | 'enterprise';
  tokens: number;
}
