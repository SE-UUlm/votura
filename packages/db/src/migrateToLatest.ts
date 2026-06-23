import { logger } from '@repo/logger';
import { promises as fs } from 'fs';
import { type Kysely, type Migration, type MigrationProvider, Migrator } from 'kysely';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Migration provider that loads migration files via a `file://` URL.
 *
 * Kysely's built-in `FileMigrationProvider` imports migration files using the
 * raw file path. On Windows that path looks like `C:\...\migration.ts`, which
 * Node.js rejects as an ESM URL (`ERR_UNSUPPORTED_ESM_URL_SCHEME`). Converting
 * the path to a `file://` URL via `pathToFileURL` makes the import work on all
 * platforms.
 */
class WindowsSafeFileMigrationProvider implements MigrationProvider {
  constructor(private readonly migrationFolder: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = await fs.readdir(this.migrationFolder);
    for (const file of files.filter((f) => f.endsWith('.ts') || f.endsWith('.js'))) {
      const filePath = path.join(this.migrationFolder, file);
      const fileUrl = pathToFileURL(filePath).href;
      const migration = (await import(fileUrl)) as Migration;
      const key = file.replace(/\.(ts|js)$/, '');
      migrations[key] = migration;
    }
    return migrations;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToLatest = async (db: Kysely<any>, migrationFolder: string): Promise<void> => {
  const migrator = new Migrator({
    db,
    provider: new WindowsSafeFileMigrationProvider(migrationFolder),
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
