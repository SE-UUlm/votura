import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import { Pool } from 'pg';
import { GenericContainer } from 'testcontainers';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';
import { migrateToLatest } from '../src/db/migrateToLatest.js';
import type { DB } from '../src/db/types/db.js';
import { kyselyLogger } from '../src/logger.js';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const builtContainer = await GenericContainer.fromDockerfile(
  path.join(DIRNAME, '../'),
  'dockerfile',
).build();

// Now configure and start the container
const container = await builtContainer
  .withEnvironment({
    POSTGRES_DB: 'votura',
    POSTGRES_USER: 'test',
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

const migrationPath = path.join(DIRNAME, '../src/db/migrations');
await migrateToLatest(migrationClient, migrationPath);

const client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: connectionString,
    }),
  }),
  log: kyselyLogger,
});

vi.mock('../src/db/database.ts', () => {
  return {
    db: client,
  };
});
