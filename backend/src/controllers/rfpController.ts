import { Response, NextFunction } from 'express';
import { RfpRequest, RfpResponse } from '../types';
import { generateRFP } from '../services/openaiService';
import { asyncHandler, ErrorTypes } from '../utils/errorHandler';

export const createRFP = asyncHandler(async (req: RfpRequest, res: Response<RfpResponse>, next: NextFunction) => {
  const { prompt } = req.body;  // Extract the prompt from the request body.

  if (!prompt) {
    throw ErrorTypes.BadRequest("Prompt is required for RFP generation.");
  }

  const rfpText = await generateRFP(prompt);
  res.status(200).json({ success: true, rfp: rfpText });
}); 