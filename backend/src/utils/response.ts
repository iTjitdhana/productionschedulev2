import { Response } from 'express';
import { APIResponse, ValidationError } from '../types';

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  meta?: Record<string, any>,
  statusCode: number = 200
): void {
  const response: APIResponse<T> = {
    success: true,
    data,
    message,
    meta,
  };

  res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  errors?: ValidationError[],
  statusCode: number = 400
): void {
  const response: APIResponse = {
    success: false,
    message,
    errors,
  };

  res.status(statusCode).json(response);
}

/**
 * Send not found response
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): void {
  sendError(res, message, undefined, 404);
}

/**
 * Send server error response
 */
export function sendServerError(
  res: Response,
  message: string = 'Internal server error',
  error?: any
): void {
  console.error('Server Error:', error);
  
  const response: APIResponse = {
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? message 
      : 'เกิดข้อผิดพลาดของระบบ',
  };

  res.status(500).json(response);
}





