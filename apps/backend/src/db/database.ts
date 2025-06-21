import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from './types/db.js';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl,
    }),
  }),
});
