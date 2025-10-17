import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Helmet Security Middleware
 * Sets various HTTP headers for security
 * Reference: DEV_STANDARD.md Section 14 (Security Standard)
 */
export function configureHelmet() {
  const isEnabled = process.env.HELMET_ENABLED !== 'false'; // Default: true
  
  if (!isEnabled) {
    console.warn('⚠️ Helmet is disabled - not recommended for production!');
    return (req: any, res: any, next: any) => next();
  }

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
}

/**
 * Rate Limit Middleware
 * Prevents brute force attacks
 * Reference: DEV_STANDARD.md Section 14 (Security Standard)
 */
export function configureRateLimit() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // Default: 1 minute
  const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100; // Default: 100 requests per window

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

