import { logger } from '@repo/logger';
import { db } from './database.js';
import { seed } from './seed.js';

seed(db)
  .then(() => {
    logger.info('Seeding completed.');
  })
  .catch((err: unknown) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Seeding failed.');
    return;
  });
