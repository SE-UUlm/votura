import express from 'express';
import dotenv from 'dotenv';
import { usersRouter } from './routes/users.routes.js';
import { db } from './db/database.js';
import { HttpStatusCode } from './httpStatusCode.js';

dotenv.config();

async function main(): Promise<void> {
  const app = express();
  const defaultPort = 4000;
  const port = process.env.PORT ?? defaultPort;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); // parse JSON bodies

  app.use('/users', usersRouter);
  // Fallback for unhandled routes
  app.use((_req, res) => {
    res.sendStatus(HttpStatusCode.BadRequest);
  });

  app
    .listen(port, () => {
      console.info(`Server is running. Listening on port ${port}`);
    })
    .on('error', (err) => {
      console.error(err);
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
