import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Migrator, FileMigrationProvider } from 'kysely';
import { db } from './database.js';
import logger from '../logger.js';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

async function migrateToLatest(): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(DIRNAME, './migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      logger.info({ migration: it.migrationName }, 'Migration was executed successfully.');
    } else if (it.status === 'Error') {
      logger.error({ migration: it.migrationName }, 'Failed to execute migration.');
    }
  });

  if (error as boolean) {
    logger.error({ error }, 'Migration failed.');
    process.exit(1);
  }

  await db.destroy();
}

try {
  await migrateToLatest();
} catch {
  logger.error('Migration failed.');
  process.exit(1);
}
