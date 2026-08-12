import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined;
}

let pool: mysql.Pool;

const sslConfig = process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {};

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'multi-tenant',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 3, // Reduced to prevent max connection issues on shared hosting
  maxIdle: 3, // Max idle connections, should be same or less than connectionLimit
  idleTimeout: 30000, // Close idle connections after 30 seconds to prevent server drops
  queueLimit: 0,
  namedPlaceholders: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ...sslConfig,
};

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool(poolConfig);
} else {
  if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool(poolConfig);
  }
  pool = global.mysqlPool;
}

export default pool;

export async function connectDB() {
  // Fallback function to match previous mongoose signature
  // Returning the pool which handles connections automatically
  return pool;
}
