import { genericContainer } from '@repo/db/genericContainer';
import { migrateToLatest } from '@repo/db/migrateToLatest';
import { seed } from '@repo/db/seed';
import type { DB } from '@repo/db/types';
import { kyselyLogger, logger } from '@repo/logger';
import { randomUUID } from 'crypto';
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
  console.log(`[e2e] environment setup started at ${new Date().toISOString()}`);
  /**
   * Postgres container setup
   */
  logger.info('Start creating postgres container...');
  dbContainer = await genericContainer
    .withName(`e2e-test-db-${randomUUID()}`)
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
  await migrationClient.destroy();
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
  await seedingClient.destroy();
  logger.info('Seeding completed.');

  /**
   * Backend setup
   */
  logger.info('Starting the backend...');
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  backendProcess = spawn(npmCmd, ['run', 'start'], {
    cwd: path.join(DIRNAME, '../../apps/backend'),
    env: {
      ...process.env,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      PORT: '4000',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      DATABASE_URL: dbConnectionUri,
    },
    stdio: 'inherit',
    shell: isWindows,
  });
  logger.info('Waiting for a heartbeat from the backend...');
  await waitOn({
    resources: ['http://localhost:4000/heartbeat'],
    delay: 1000,
    timeout: 30000,
  });
  logger.info('The backend is listening.');
  console.log(`[e2e] environment setup completed at ${new Date().toISOString()}`);
};

export const stopTestEnv = async (): Promise<void> => {
  console.log(`[e2e] environment teardown started at ${new Date().toISOString()}`);
  if (backendProcess?.pid != null) {
    console.log(`[e2e] stopping backend process ${backendProcess.pid}`);
    if (process.platform === 'win32') {
      await new Promise<void>((resolve) => {
        const killer = spawn('taskkill', ['/pid', String(backendProcess?.pid), '/T', '/F']);

        killer.on('close', () => {
          resolve();
        });
      });
    } else {
      backendProcess.kill();
    }
  }

  console.log('[e2e] stopping postgres container');
  await dbContainer?.stop();

  backendProcess = null;
  dbContainer = null;
  console.log(`[e2e] environment teardown completed at ${new Date().toISOString()}`);
};
