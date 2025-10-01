import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL as string;
if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Drizzle client will not connect.');
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool);
