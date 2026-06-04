import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validate that database url is defined
if (!config.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not defined in the environment variables.');
}
