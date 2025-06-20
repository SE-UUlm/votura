import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';
import { db } from './database.js';
import { migrateToLatest } from './migrateToLatest.js';

try {
  const FILENAME = fileURLToPath(import.meta.url);
  const DIRNAME = path.dirname(FILENAME);

  const migrationPath = path.join(DIRNAME, './migrations');
  await migrateToLatest(db, migrationPath);
} catch {
  logger.error('Migration failed.');
  process.exit(1);
}
