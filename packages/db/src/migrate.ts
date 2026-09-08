import { logger } from '@repo/logger';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';
import { migrateToLatest } from './migrateToLatest.js';

try {
  const FILENAME = fileURLToPath(import.meta.url);
  const DIRNAME = path.dirname(FILENAME);

  const migrationPath = path.join(DIRNAME, './migrations');
  await migrateToLatest(db, migrationPath);
} catch (error) {
  logger.error({ err: error }, 'Migration failed.');
  process.exit(1);
}
