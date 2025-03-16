import axios from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async (): Promise<string> => {
  const response = await api.get('/health');
  return response.data.status;
};

export const getTestStatus = async (): Promise<ApiResponse<any>> => {
  const response = await api.get('/test/status');
  return response.data;
};

export const generateRFP = async (prompt: string): Promise<string> => {
  const response = await api.post('/rfp', { prompt });
  return response.data.rfp;
};

export default api; 