import dotenv from 'dotenv';
import type { LogEvent } from 'kysely';
import pino from 'pino';

dotenv.config();

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      level: 'debug',
      options: {
        destination: 'logs/debug.json',
        mkdir: true,
        append: false,
      },
    },
    {
      target: 'pino-pretty',
      level: 'debug',
      options: {
        destination: 'logs/debug.log',
        colorize: false,
        mkdir: true,
        append: false,
      },
    },
    {
      target: 'pino-pretty',
      level: process.env.TERMINAL_LOG_LEVEL ?? 'info',
      options: {
        destination: process.stdout.fd,
        colorize: true,
      },
    },
  ],
}) as pino.DestinationStream;

const logger = pino.pino(
  {
    level: 'debug',
    redact: { paths: ['email', 'password'], censor: '***', remove: false },
  },
  transport,
);

export const kyselyLogger = (event: LogEvent): void => {
  if (event.level === 'error') {
    logger.error(
      {
        error: event.error,
        query: event.query.sql,
        params: event.query.parameters,
        duration: event.queryDurationMillis,
      },
      'DB query execution failed',
    );
  }

  if (event.level === 'query') {
    logger.debug(
      {
        query: event.query.sql,
        params: event.query.parameters,
        duration: event.queryDurationMillis,
      },
      'DB query successfully executed',
    );
  }
};
export default logger;
