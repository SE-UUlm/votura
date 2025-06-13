import express from 'express';
import dotenv from 'dotenv';
import { usersRouter } from './routes/users.routes.js';
import { db } from './db/database.js';
import { StatusCode } from './utils/statusCode.js';
import { ExitCode } from './utils/exitCode.js';

dotenv.config();

const CUSTOM_PORT = 4000;

async function main() {
  const app = express();
  const PORT = process.env.PORT ?? CUSTOM_PORT;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); // parse JSON bodies

  app.use('/users', usersRouter);
  // Fallback for unhandled routes
  app.use((_, res) => {
    res.sendStatus(StatusCode.BAD_REQUEST);
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
    process.exit(ExitCode.SUCCESS);
  });
