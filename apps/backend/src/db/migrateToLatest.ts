import { FileMigrationProvider, type Kysely, Migrator } from 'kysely';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../logger.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToLatest = async (db: Kysely<any>, migrationFolder: string): Promise<void> => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: migrationFolder,
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
};
