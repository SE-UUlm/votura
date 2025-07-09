import { db } from '@repo/db';
import { logger } from '@repo/logger';
import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config();

const defaultPort = 4000;
const port = process.env.PORT ?? defaultPort;

function main(): void {
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
