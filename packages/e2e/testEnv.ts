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
let frontendProcess: ChildProcess | null = null;

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

  logger.info('Running seed...');

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

  logger.info('Starting frontend...');
  frontendProcess = spawn('npm', ['run', 'start'], {
    cwd: path.join(DIRNAME, '../../apps/frontend'),
    env: {
      ...process.env,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      PORT: '5173',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      VITE_API_BASE_URL: 'http://localhost:4000',
    },
    stdio: 'inherit',
  });

  await waitOn({
    resources: ['http://localhost:5173/'],
    delay: 5000,
    timeout: 240000,
  });
  logger.info('Frontend started.');

  logger.info('Starting backend...');
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

  await waitOn({
    resources: ['http://localhost:4000/heart-beat'],
    delay: 1000,
    timeout: 30000,
  });
  logger.info('Backend started.');
};

export const stopTestEnv = async (): Promise<void> => {
  await dbContainer?.stop();
  backendProcess?.kill();
  frontendProcess?.kill();
};
