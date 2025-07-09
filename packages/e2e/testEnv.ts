import { genericContainer } from '@repo/db/genericContainer';
import { migrateToLatest } from '@repo/db/migrateToLatest';
import type { DB } from '@repo/db/types';
import { kyselyLogger, logger } from '@repo/logger';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import { Pool } from 'pg';
import type { StartedTestContainer } from 'testcontainers';
import { fileURLToPath } from 'url';

let dbContainer: StartedTestContainer;

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

export const startTestEnv = async (): Promise<void> => {
  logger.info('Creating postgres container...');
  dbContainer = await genericContainer
    .withEnvironment({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      POSTGRES_DB: 'votura',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      POSTGRES_USER: 'test',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      POSTGRES_PASSWORD: 'test',
    })
    .withExposedPorts(5432)
    .start();

  const dbConnectionUri = `postgresql://test:test@${dbContainer.getHost()}:${dbContainer.getMappedPort(5432)}/votura`;
  process.env.DATABASE_URL = dbConnectionUri;
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
