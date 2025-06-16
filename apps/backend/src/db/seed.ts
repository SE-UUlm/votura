import { db } from './database.js';
import logger from '../logger.js';

async function seed(): Promise<void> {
  await db
    .insertInto('User')
    .values({
      email: 'someemail@domain.com',
      passwordHash: 'hashedpassword',
    })
    .execute();
}

seed()
  .then(() => {
    logger.info('Seeding completed.');
    return db.destroy();
  })
  .catch((err: unknown) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Seeding failed.');
    return db.destroy();
  });
