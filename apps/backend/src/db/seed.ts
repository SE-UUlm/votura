import { db } from './database.js';

async function seed() {
  await db.insertInto('User').values(
    {
      id: '612a7ac6-7c2a-490d-9d71-78bd67421652',
      email: 'someemail@domain.com',
      passwordHash: 'hashedpassword',
      verified: true,
      modifiedAt: new Date().toISOString(),
    }
  ).executeTakeFirst();
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
