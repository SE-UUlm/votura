import { db } from './database.js';

async function seed(): Promise<void> {
  await db
    .insertInto('User')
    .values({
      email: 'user@votura.org',
      passwordHash: 'hashedpassword',
    })
    .execute();
}

seed()
  .then(() => {
    console.info('Seeding completed.');
    return db.destroy();
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    return db.destroy();
  });
