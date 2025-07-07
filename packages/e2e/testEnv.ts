import { migrateToLatest } from '@repo/db/migrateToLatest';
import type { DB } from '@repo/db/types';
import { kyselyLogger, logger } from '@repo/logger';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

let dbContainer: StartedPostgreSqlContainer;

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

export const startTestEnv = async (): Promise<void> => {
  logger.info('Creating postgres container...');
  dbContainer = await new PostgreSqlContainer('postgres:17.4').start();
  const dbConnectionUri = dbContainer.getConnectionUri();
  process.env.DATABASE_URL = dbConnectionUri;
  process.env.HOME = '/root'
  logger.info('Postgres container created.');

  logger.info('Running migration...');
  const migrationClient = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: dbConnectionUri,
      }),
    }),
    log: kyselyLogger,
  });

  const migrationPath = path.join(DIRNAME, '../db/src/migrations');
  await migrateToLatest(migrationClient, migrationPath);
  logger.info('Migration completed.');
};

export const stopTestEnv = async (): Promise<void> => {
  await dbContainer?.stop();
};
