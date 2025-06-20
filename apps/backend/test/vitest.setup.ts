import { vi } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from '../src/db/types/db.js';
import { Pool } from 'pg';
import { migrateToLatest } from '../src/db/migrateToLatest.js';
import { fileURLToPath } from 'url';
import path from 'path';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

let client: Kysely<DB>;

const container = await new PostgreSqlContainer('postgres:17.4').start();

client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: container.getConnectionUri(),
    }),
  }),
});

await migrateToLatest(client, path.join(DIRNAME, '../src/db/migrations'));

client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: container.getConnectionUri(),
    }),
  }),
});

vi.mock('../src/db/database.ts', () => {
  return {
    db: client,
  };
});
