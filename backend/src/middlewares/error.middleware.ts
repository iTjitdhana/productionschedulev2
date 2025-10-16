import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Custom Error Class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`Error: ${err.message}`, {
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production - don't leak error details
    res.status(err.statusCode).json({
      success: false,
      message: err.isOperational ? err.message : 'เกิดข้อผิดพลาดของระบบ',
    });
  }
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `ไม่พบ endpoint: ${req.method} ${req.originalUrl}`,
  });
}





