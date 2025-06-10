import { db } from './database.js';

async function seed() {
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
    console.log('Seeding completed.');
    return db.destroy();
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    return db.destroy();
  });
