import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'prathmesh_roadlines',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

export const db = mysql.createPool(dbConfig);

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('running on 3001 port' )
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};
export const initializeDatabase = async (): Promise<void> => {
  try {
    await testConnection();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    console.log('⚠️ Continuing without database connection for testing...');
    // process.exit(1); // Commented out to allow server to start without database
  }
};
export default db;
