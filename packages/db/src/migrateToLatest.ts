import { logger } from '@repo/logger';
import { readdir } from 'fs/promises';
import { type Kysely, type Migration, type MigrationProvider, Migrator } from 'kysely';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Creates a migration provider that loads migration files via a `file://` URL.
 *
 * Kysely's built-in `FileMigrationProvider` imports migration files using the
 * raw file path. On Windows that path looks like `C:\...\migration.ts`, which
 * Node.js rejects as an ESM URL (`ERR_UNSUPPORTED_ESM_URL_SCHEME`). Converting
 * the path to a `file://` URL via `pathToFileURL` makes the import work on all
 * platforms.
 */
const createWindowsSafeMigrationProvider = (migrationFolder: string): MigrationProvider => ({
  async getMigrations(): Promise<Record<string, Migration>> {
    const files = await readdir(migrationFolder);
    const migrationFiles = files.filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    const entries = await Promise.all(
      migrationFiles.map(async (file): Promise<[string, Migration]> => {
        const fileUrl = pathToFileURL(path.join(migrationFolder, file)).href;
        const migration = (await import(fileUrl)) as Migration;
        const key = file.replace(/\.(ts|js)$/, '');
        return [key, migration];
      }),
    );

    return Object.fromEntries(entries);
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateToLatest = async (db: Kysely<any>, migrationFolder: string): Promise<void> => {
  const migrator = new Migrator({
    db,
    provider: createWindowsSafeMigrationProvider(migrationFolder),
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
