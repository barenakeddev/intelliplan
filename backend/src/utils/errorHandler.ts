import { Request, Response, NextFunction } from 'express';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, isOperational: boolean, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-defined error types
export const ErrorTypes = {
  NotFound: (message: string) => new AppError(message, 404, true, 'NOT_FOUND'),
  BadRequest: (message: string) => new AppError(message, 400, true, 'BAD_REQUEST'),
  Unauthorized: (message: string) => new AppError(message, 401, true, 'UNAUTHORIZED'),
  Forbidden: (message: string) => new AppError(message, 403, true, 'FORBIDDEN'),
  Conflict: (message: string) => new AppError(message, 409, true, 'CONFLICT'),
  Internal: (message: string) => new AppError(message, 500, false, 'INTERNAL_SERVER_ERROR'),
  Database: (message: string, isOperational = false) => new AppError(message, 503, isOperational, 'DATABASE_ERROR'),
  ExternalService: (message: string, serviceName: string) =>
    new AppError(message, 502, true, `EXTERNAL_SERVICE_${serviceName.toUpperCase()}`)
};

// Basic logger (replace with a more robust logging library in production)
export const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`);
    if (error) {
      if (error instanceof AppError && error.isOperational) {
        return; // Don't log operational errors
      }
      console.error(error);
    }
  }
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    const clientError = {
      success: false,
      message: err.isOperational ? err.message : "Internal Server Error",
      ...(process.env.NODE_ENV !== 'production' && !err.isOperational ? { stack: err.stack } : {})
    };
    return res.status(err.statusCode).json(clientError);
  }

  logger.error('Unhandled Error:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
};

// Wrapper for async route handlers
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}; 