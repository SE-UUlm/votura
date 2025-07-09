import { genericContainer } from '@repo/db/genericContainer';
import { migrateToLatest } from '@repo/db/migrateToLatest';
import type { DB } from '@repo/db/types';
import { kyselyLogger } from '@repo/logger';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

// Now configure and start the container
const container = await genericContainer
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

const connectionString = `postgresql://test:test@${container.getHost()}:${container.getMappedPort(5432)}/votura`;

const migrationClient = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: connectionString,
    }),
  }),
  log: kyselyLogger,
});

const migrationPath = path.join(DIRNAME, '../../../packages/db/src/migrations');
await migrateToLatest(migrationClient, migrationPath);

const client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: connectionString,
    }),
  }),
  log: kyselyLogger,
});

vi.mock('@repo/db', () => {
  return {
    db: client,
  };
});
