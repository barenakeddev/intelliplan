import { Request, Response, NextFunction } from 'express';
import { getTestStatus } from '../services/testService';
import { asyncHandler } from '../utils/errorHandler';

/**
 * Gets the test status from the database
 */
export const getStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const data = await getTestStatus();
  res.status(200).json({ 
    success: true, 
    data 
  });
}); 