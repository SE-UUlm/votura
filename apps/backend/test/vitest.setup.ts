import { migrateToLatest } from '@repo/db/migrateToLatest';
import type { DB } from '@repo/db/types';
import { kyselyLogger } from '@repo/logger';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const container = await new PostgreSqlContainer('postgres:17.4').start();

const migrationClient = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: container.getConnectionUri(),
    }),
  }),
  log: kyselyLogger,
});

const migrationPath = path.join(DIRNAME, '../../../packages/db/src/migrations');
await migrateToLatest(migrationClient, migrationPath);

const client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: container.getConnectionUri(),
    }),
  }),
  log: kyselyLogger,
});

vi.mock('@repo/db', () => {
  return {
    db: client,
  };
});
