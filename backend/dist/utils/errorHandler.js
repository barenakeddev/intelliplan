"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.logger = exports.ErrorTypes = exports.AppError = void 0;
// Custom error class
class AppError extends Error {
    constructor(message, statusCode, isOperational, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Pre-defined error types
exports.ErrorTypes = {
    NotFound: (message) => new AppError(message, 404, true, 'NOT_FOUND'),
    BadRequest: (message) => new AppError(message, 400, true, 'BAD_REQUEST'),
    Unauthorized: (message) => new AppError(message, 401, true, 'UNAUTHORIZED'),
    Forbidden: (message) => new AppError(message, 403, true, 'FORBIDDEN'),
    Conflict: (message) => new AppError(message, 409, true, 'CONFLICT'),
    Internal: (message) => new AppError(message, 500, false, 'INTERNAL_SERVER_ERROR'),
    Database: (message, isOperational = false) => new AppError(message, 503, isOperational, 'DATABASE_ERROR'),
    ExternalService: (message, serviceName) => new AppError(message, 502, true, `EXTERNAL_SERVICE_${serviceName.toUpperCase()}`)
};
// Basic logger (replace with a more robust logging library in production)
exports.logger = {
    info: (message) => console.log(`[INFO] ${message}`),
    warn: (message) => console.warn(`[WARN] ${message}`),
    error: (message, error) => {
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
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        const clientError = Object.assign({ success: false, message: err.isOperational ? err.message : "Internal Server Error" }, (process.env.NODE_ENV !== 'production' && !err.isOperational ? { stack: err.stack } : {}));
        return res.status(err.statusCode).json(clientError);
    }
    exports.logger.error('Unhandled Error:', err);
    return res.status(500).json(Object.assign({ success: false, message: 'Internal Server Error' }, (process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})));
};
exports.errorHandler = errorHandler;
// Wrapper for async route handlers
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
