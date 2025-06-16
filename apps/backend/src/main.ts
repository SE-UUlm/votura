import express from 'express';
import dotenv from 'dotenv';
import { usersRouter } from './routes/users.routes.js';
import { db } from './db/database.js';

dotenv.config();

async function main() {
  const app = express();
  const PORT = process.env.PORT ?? 4000;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); // parse JSON bodies

  app.use('/users', usersRouter);
  // Fallback for unhandled routes
  app.use((_, res) => {
    res.sendStatus(400);
  });

  app.listen(PORT, () => {
    console.log(`Server is running.`);
  });
}

main()
  .then(async () => {
    await db.destroy();
  })
  .catch(async (e) => {
    console.error(e);
    await db.destroy();
    process.exit(1);
  });
