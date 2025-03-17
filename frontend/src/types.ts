export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ConversationType {
  id: string;
  name: string;
  snippet: string;
  created_at: string;
  last_updated: string;
  user_id: string;
  event_id?: string;
} 