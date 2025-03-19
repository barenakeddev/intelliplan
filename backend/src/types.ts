import { Request } from 'express';

// Interface for RFP request
export interface RfpRequest extends Request {
  body: {
    prompt: string;
  };
}

// Interface for RFP response
export interface RfpResponse {
  success: boolean;
  rfp: string;
}

// Interface for conversation request
export interface ConversationRequest extends Request {
  body: {
    conversationId?: string;
  };
}

// Interface for message request
export interface MessageRequest extends Request {
  body: {
    conversationId: string;
    message: string;
  };
} 