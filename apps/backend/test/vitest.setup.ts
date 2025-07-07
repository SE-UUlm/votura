import { kyselyLogger } from '@repo/logger';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';
import { migrateToLatest } from '../src/db/migrateToLatest.js';
import type { DB } from '../src/db/types/db.js';

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

const migrationPath = path.join(DIRNAME, '../src/db/migrations');
await migrateToLatest(migrationClient, migrationPath);

const client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: container.getConnectionUri(),
    }),
  }),
  log: kyselyLogger,
});

vi.mock('../src/db/database.ts', () => {
  return {
    db: client,
  };
});
