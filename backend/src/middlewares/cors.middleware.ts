import cors from 'cors';

/**
 * CORS Configuration
 */
export function configureCors() {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  
  const corsOptions: cors.CorsOptions = {
    origin: corsOrigin === '*' 
      ? '*'  // Allow all origins (Development)
      : corsOrigin.split(',').map(origin => origin.trim()), // Specific origins (Production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
  };

  return cors(corsOptions);
}





