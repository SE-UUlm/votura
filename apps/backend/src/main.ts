import express from 'express';
import dotenv from 'dotenv';
import { usersRouter } from './routes/users.routes.js';
import { db } from './db/database.js';
import logger from './logger.js';
import pinoHttp from 'pino-http';
import { auth } from './middlewares/auth.js';
import { electionsRouter } from './routes/elections.routes.js';
import { HttpStatusCode } from './httpStatusCode.js';

dotenv.config();

function main(): void {
  const app = express();
  const defaultPort = 4000;
  const port = process.env.PORT ?? defaultPort;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); // parse JSON bodies
  app.use(pinoHttp.pinoHttp({ logger }));

  app.use('/users', usersRouter);
  app.use('/elections', [auth, electionsRouter]);
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

Promise.resolve()
  .then(() => {
    main();
  })
  .then(async () => {
    await db.destroy();
  })
  .catch(async (e) => {
    logger.error(e);
    await db.destroy();
    process.exit(1);
  });
