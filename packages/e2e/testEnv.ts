import { genericContainer } from '@repo/db/genericContainer';
import { migrateToLatest } from '@repo/db/migrateToLatest';
import { seed } from '@repo/db/seed';
import type { DB } from '@repo/db/types';
import { kyselyLogger, logger } from '@repo/logger';
import { Kysely, PostgresDialect } from 'kysely';
import { type ChildProcess, spawn } from 'node:child_process';
import path from 'path';
import { Pool } from 'pg';
import type { StartedTestContainer } from 'testcontainers';
import { fileURLToPath } from 'url';
import waitOn from 'wait-on';

let dbContainer: StartedTestContainer | null = null;
let backendProcess: ChildProcess | null = null;

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

export const startTestEnv = async (): Promise<void> => {
  /**
   * Postgres container setup
   */
  logger.info('Start creating postgres container...');
  dbContainer = await genericContainer
    .withName('e2e-test-db-' + Math.floor(Math.random() * 100000))
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
  logger.info({ dbConnectionUri }, 'Postgres container is listening.');

  logger.info('Start postgres migration...');
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

  logger.info('Start running seed...');
  const seedingClient = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: dbConnectionUri,
      }),
    }),
    log: kyselyLogger,
  });
  await seed(seedingClient);
  logger.info('Seeding completed.');

  /**
   * Backend setup
   */
  logger.info('Starting the backend...');
  backendProcess = spawn('npm', ['run', 'start'], {
    cwd: path.join(DIRNAME, '../../apps/backend'),
    env: {
      ...process.env,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      PORT: '4000',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      DATABASE_URL: dbConnectionUri,
    },
    stdio: 'inherit',
  });
  logger.info('Waiting for a heartbeat from the backend...');
  await waitOn({
    resources: ['http://localhost:4000/heartbeat'],
    delay: 1000,
    timeout: 30000,
  });
  logger.info('The backend is listening.');
};

export const stopTestEnv = async (): Promise<void> => {
  await dbContainer?.stop();
  backendProcess?.kill();
};
