import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Migrator, FileMigrationProvider } from 'kysely';
import { db } from './database.js';
import { ExitCode } from '../utils/exitCode.js';

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
      console.info(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error as boolean) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(ExitCode.GENERAL_ERROR);
  }

  await db.destroy();
}

try {
  await migrateToLatest();
} catch {
  console.error('Migration failed');
  process.exit(ExitCode.GENERAL_ERROR);
}
