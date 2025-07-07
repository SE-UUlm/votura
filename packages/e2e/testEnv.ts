import { migrateToLatest } from '@repo/db/migrateToLatest';
import type { DB } from '@repo/db/types';
import { kyselyLogger, logger } from '@repo/logger';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { type ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import waitOn from 'wait-on';

let dbContainer: StartedPostgreSqlContainer;
let backendProcess: ChildProcessWithoutNullStreams;
let frontendProcess: ChildProcessWithoutNullStreams;

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

export const startTestEnv = async (): Promise<void> => {
  logger.info('Creating postgres container...');
  dbContainer = await new PostgreSqlContainer('postgres:17.4').start();
  logger.info('Postgres container created.');

  logger.info('Running migration...');
  const migrationClient = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: dbContainer.getConnectionUri(),
      }),
    }),
    log: kyselyLogger,
  });

  const migrationPath = path.join(DIRNAME, '../db/src/migrations');
  await migrateToLatest(migrationClient, migrationPath);
  logger.info('Migration completed.');

  logger.info('Spawning backend process...');
  backendProcess = spawn('npm', ['run', 'start'], {
    cwd: path.join(DIRNAME, '../../apps/backend'),
    env: {
      ...process.env,
      DATABASE_URL: dbContainer.getConnectionUri(),
      PORT: '4000',
      PEPPER: '1234',
    },
  });

  logger.info('Waiting for backend process...');
  await waitOn({
    resources: ['http://localhost:4000'],
    timeout: 20000,
    validateStatus: (status) => {
      logger.info(status);
      return status === 400;
    },
  });
  logger.info('Backend process spawned.');

  logger.info('Spawning frontend process...');
  frontendProcess = spawn('npm', ['run', 'start'], {
    cwd: '../../apps/frontend',
    env: {
      ...process.env,
      VITE_API_BASE_URL: 'http://localhost:4000',
    },
  });

  logger.info('Waiting for frontend process...');
  await waitOn({ resources: ['http://localhost:5173'] });
  logger.info('Frontend process spawned.');
};

export const stopTestEnv = async (): Promise<void> => {
  await dbContainer?.stop();
  backendProcess?.kill();
  frontendProcess?.kill();
};
