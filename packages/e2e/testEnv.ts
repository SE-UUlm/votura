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

const e2eLog = (message: string): void => {
  process.stderr.write(`[e2e] ${message} ${new Date().toISOString()}\n`);
};

export const startTestEnv = async (): Promise<void> => {
  e2eLog('environment setup started');
  /**
   * Postgres container setup
   */
  e2eLog('starting postgres container');
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
  e2eLog('postgres container started');
  const dbConnectionUri = `postgresql://test:test@${dbContainer.getHost()}:${dbContainer.getMappedPort(5432)}/votura`;
  logger.info({ dbConnectionUri }, 'Postgres container is listening.');

  e2eLog('starting postgres migration');
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
  e2eLog('postgres migration completed');
  logger.info('Migration completed.');

  e2eLog('starting database seed');
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
  e2eLog('database seed completed');
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
  e2eLog(`backend process started with PID ${backendProcess.pid ?? 'unknown'}`);
  logger.info('Waiting for a heartbeat from the backend...');
  e2eLog('waiting for backend heartbeat');
  await waitOn({
    resources: ['http://localhost:4000/heartbeat'],
    delay: 1000,
    timeout: 30000,
  });
  logger.info('The backend is listening.');
  e2eLog('backend heartbeat received; environment setup completed');
};

export const stopTestEnv = async (): Promise<void> => {
  e2eLog('environment teardown started');
  if (backendProcess?.pid != null) {
    e2eLog(`stopping backend process ${backendProcess.pid}`);
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
    e2eLog('backend process terminated');
  }

  e2eLog('stopping postgres container');
  await dbContainer?.stop();
  e2eLog('postgres container stopped');

  backendProcess = null;
  dbContainer = null;
  e2eLog('environment teardown completed');
};
