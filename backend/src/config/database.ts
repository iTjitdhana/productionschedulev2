import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });

// Validate required environment variables (DEV_STANDARD compliant)
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('💡 Please create backend/.env.development or backend/.env.production from backend/.env.example');
  process.exit(1);
}

// Debug: Environment variables loaded (only show in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Database Environment check:');
  console.log('   ENV File:', envFile);
  console.log('   DB_HOST:', process.env.DB_HOST);
  console.log('   DB_USER:', process.env.DB_USER);
  console.log('   DB_PASSWORD:', '***' + process.env.DB_PASSWORD?.slice(-2));
  console.log('   DB_NAME:', process.env.DB_NAME);
}

// Database configuration (MySQL connection pool)
// ⚠️ NO hardcoded fallbacks - all values from ENV
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: Number(process.env.DB_PORT) || 3306,
  timezone: process.env.DB_TIMEZONE || '+07:00',
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  dateStrings: process.env.DB_DATE_STRINGS !== 'false', // Default true
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

