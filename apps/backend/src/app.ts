import { httpLogger, logger } from '@repo/logger';
import { response400Object, response500Object } from '@repo/votura-validators';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { setUsersJWTKeyPair } from './auth/generateJWTKeyPair.js';
import { HttpStatusCode } from './httpStatusCode.js';
import { authenticateAccessToken } from './middlewares/auth.js';
import { electionsRouter } from './routes/elections.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { voterGroupsRouter } from './routes/voterGroups.routes.js';

dotenv.config();
setUsersJWTKeyPair();

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parse JSON bodies
app.use(httpLogger);

app.use('/users', usersRouter);
app.use('/elections', [authenticateAccessToken, electionsRouter]);
app.use('/voterGroups', [authenticateAccessToken, voterGroupsRouter]);
app.use('/heartbeat', (_req, res) => {
  res.sendStatus(HttpStatusCode.noContent);
});
// Fallback for unhandled routes
app.use((_req, res) => {
  res
    .status(HttpStatusCode.badRequest)
    .json(
      response400Object.parse({ message: 'Invalid request! The requested route does not exist.' }),
    );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'An error occurred in the request handler');
  res
    .status(HttpStatusCode.internalServerError)
    .json(response500Object.parse({ message: undefined }));
});
