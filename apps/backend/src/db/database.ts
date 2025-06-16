import type { DB } from './types/db.js';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import dotenv from 'dotenv';
dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://votura:votura@localhost:5432/votura?schema=public';

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl,
    }),
  }),
});
