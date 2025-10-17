import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: Check if environment variables are loaded
console.log('🔍 Environment check:');
console.log('   DB_HOST:', process.env.DB_HOST ? '✓' : '✗ NOT LOADED');
console.log('   DB_USER:', process.env.DB_USER ? '✓' : '✗ NOT LOADED');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '✓ (hidden)' : '✗ NOT LOADED');
console.log('   DB_NAME:', process.env.DB_NAME ? '✓' : '✗ NOT LOADED');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '192.168.0.96',
  user: process.env.DB_USER || 'jitdhana',
  password: process.env.DB_PASSWORD || 'iT12345$', // Add fallback
  database: process.env.DB_NAME || 'manufacturing_system',
  port: Number(process.env.DB_PORT) || 3306,
  timezone: process.env.DB_TIMEZONE || '+07:00',
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  dateStrings: process.env.DB_DATE_STRINGS === 'true' || true, // Return dates as strings to avoid timezone issues
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  waitForConnections: true,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Timezone: ${dbConfig.timezone}`);
    connection.release();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });

export default pool;

