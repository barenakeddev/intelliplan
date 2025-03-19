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

// Legacy method - can be used for one-off RFP generation
export const generateRFP = async (prompt: string): Promise<string> => {
  const response = await api.post('/rfp', { prompt });
  return response.data.rfp;
};

// New conversation-based API methods
export const startConversation = async (): Promise<{ conversationId: string, message: string }> => {
  const response = await api.post('/rfp/conversation');
  return {
    conversationId: response.data.conversationId,
    message: response.data.message,
  };
};

export const sendMessage = async (conversationId: string, message: string): Promise<string> => {
  const response = await api.post('/rfp/message', { conversationId, message });
  return response.data.message;
};

export const generateFinalRFP = async (conversationId: string): Promise<string> => {
  const response = await api.post('/rfp/generate', { conversationId });
  return response.data.rfp;
};

export default api; 