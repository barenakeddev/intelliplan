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