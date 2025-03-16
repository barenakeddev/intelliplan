export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface TestStatus {
  id: number;
  status: boolean;
} 