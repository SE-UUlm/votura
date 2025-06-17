import express from 'express';
import dotenv from 'dotenv';
import { usersRouter } from './routes/users.routes.js';
import { db } from './db/database.js';
import logger from './logger.js';
import pinoHttp from 'pino-http';
import { electionsRouter } from './routes/elections.routes.js';
import { HttpStatusCode } from './httpStatusCode.js';
import { cleanupExpiredTokens } from './services/cleanupService.js';

dotenv.config();

function main(): void {
  const app = express();
  const defaultPort = 4000;
  const port = process.env.PORT ?? defaultPort;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); // parse JSON bodies
  app.use(pinoHttp.pinoHttp({ logger }));

  app.use('/users', usersRouter);
  app.use('/elections', electionsRouter);
  // Fallback for unhandled routes
  app.use((_req, res) => {
    res.sendStatus(HttpStatusCode.BadRequest);
  });

  // Cleanup expired tokens every hour
  setInterval(
    async () => {
      try {
        await cleanupExpiredTokens();
        console.info('Expired tokens cleaned up');
      } catch (error) {
        console.warn('Token cleanup failed:', error);
      }
    },
    60 * 60 * 1000,
  ); // 1 hour

  logger.debug('Starting server.');
  app.listen(port, () => {
    logger.info({ port: port }, 'Server is listening.');
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
