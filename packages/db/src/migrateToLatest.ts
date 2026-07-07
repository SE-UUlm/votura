import { logger } from '@repo/logger';
import { promises as fs } from 'fs';
import { type Kysely, type Migration, type MigrationProvider, Migrator } from 'kysely';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Drop-in replacement for kysely's FileMigrationProvider.
 * FileMigrationProvider imports migration files by their plain absolute path, which the ESM
 * loader rejects on Windows ("Received protocol 'c:'"). This provider imports the files via
 * file:// URLs instead, which works on all platforms.
 */
const fileUrlMigrationProvider = (migrationFolder: string): MigrationProvider => ({
  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};

    for (const fileName of (await fs.readdir(migrationFolder)).sort()) {
      if (!fileName.endsWith('.ts') || fileName.endsWith('.d.ts')) {
        continue;
      }

      const migration: unknown = await import(
        pathToFileURL(path.join(migrationFolder, fileName)).href
      );
      migrations[fileName.substring(0, fileName.lastIndexOf('.'))] = migration as Migration;
    }

    return migrations;
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToLatest = async (db: Kysely<any>, migrationFolder: string): Promise<void> => {
  const migrator = new Migrator({
    db,
    provider: fileUrlMigrationProvider(migrationFolder),
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
