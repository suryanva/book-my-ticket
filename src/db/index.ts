import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sql_class_2_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper function to keep code DRY (Don't Repeat Yourself)
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Export the pool for transactions (where you need pool.connect())
export default pool;