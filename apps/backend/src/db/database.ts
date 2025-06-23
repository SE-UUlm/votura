import dotenv from 'dotenv';
import { Kysely, PostgresDialect, type LogEvent } from 'kysely';
import { Pool } from 'pg';
import logger from './../logger.js';
import type { DB } from './types/db.js';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const kyselyLogger = (event: LogEvent): void => {
  if (event.level === 'error') {
    logger.error({ event }, 'DB query error');
  }

  if (event.level === 'query') {
    logger.debug(
      {
        query: event.query.sql,
        params: event.query.parameters,
        duration: event.queryDurationMillis,
      },
      'DB query executed',
    );
  }
};

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl,
    }),
  }),
  log: kyselyLogger,
});
