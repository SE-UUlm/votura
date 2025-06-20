import pino from 'pino';

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

export default logger;
