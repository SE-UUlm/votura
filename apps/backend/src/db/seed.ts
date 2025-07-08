import logger from '../logger.js';
import { db } from './database.js';

async function seed(): Promise<void> {
  const user = await db
    .insertInto('user')
    .values({
      email: 'user@votura.org',
      passwordHash: 'hashedpassword',
    })
    .returningAll()
    .executeTakeFirst();

  if (user === undefined) {
    throw Error('User could not be created');
  }

  await db
    .insertInto('election')
    .values({
      electionCreatorId: user.id,
      name: 'Election 1',
      description: 'This is election one',
      votingStartAt: new Date('2024-07-29T15:51:28.071Z'),
      votingEndAt: new Date('2024-07-30T15:51:28.071Z'),
    })
    .returningAll()
    .executeTakeFirst();
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
