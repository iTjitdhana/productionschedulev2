import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Trace ID Middleware
 * Adds unique trace ID to each request for logging and debugging
 * Reference: DEV_STANDARD.md Section 15 (Logging & Monitoring)
 */

// Extend Express Request type to include traceId
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate or use existing trace ID
  const traceId = req.headers['x-trace-id'] as string || uuidv4();
  
  // Attach to request object
  req.traceId = traceId;
  
  // Add to response headers for client tracking
  res.setHeader('X-Trace-ID', traceId);
  
  next();
}

/**
 * Get trace ID from request
 */
export function getTraceId(req: Request): string {
  return req.traceId || 'unknown';
}

