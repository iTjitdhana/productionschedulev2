import express, { Application } from 'express';
import dotenv from 'dotenv';
import { configureCors } from './middlewares/cors.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { configureHelmet, configureRateLimit } from './middlewares/security.middleware';
import { traceIdMiddleware } from './middlewares/trace.middleware';
import workplanRoutes from './routes/workplans';
import logger from './utils/logger';
import './config/database'; // Initialize database connection

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = Number(process.env.PORT) || 3107;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Security Middlewares (DEV_STANDARD compliant)
app.use(configureHelmet()); // Security headers
app.use(traceIdMiddleware); // Trace ID for logging

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use(configureCors());

// Rate Limiting (Apply globally or per-route)
if (process.env.NODE_ENV === 'production') {
  app.use(configureRateLimit());
  logger.info('✅ Rate limiting enabled (production mode)');
}

// Request logging middleware (with trace ID)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const traceId = req.traceId || 'unknown';
    logger.info(
      `[${traceId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// Routes
app.use(API_PREFIX, workplanRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Production Schedule Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: `${API_PREFIX}/health`,
      workplans: `${API_PREFIX}/workplans?date=YYYY-MM-DD`,
      workplanById: `${API_PREFIX}/workplans/:id`,
    },
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
// Listen on 0.0.0.0 to allow connections from other machines in the network
app.listen(PORT, '0.0.0.0', () => {
  logger.info('='.repeat(60));
  logger.info(`🚀 Production Schedule Backend API`);
  logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`   Server running on: http://0.0.0.0:${PORT}`);
  logger.info(`   API prefix: ${API_PREFIX}`);
  logger.info(`   CORS: ${process.env.CORS_ORIGIN || '*'}`);
  logger.info('='.repeat(60));
  logger.info('Available endpoints:');
  logger.info(`   GET  ${API_PREFIX}/health`);
  logger.info(`   GET  ${API_PREFIX}/workplans?date=YYYY-MM-DD`);
  logger.info(`   GET  ${API_PREFIX}/workplans/:id`);
  logger.info('='.repeat(60));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

export default app;





