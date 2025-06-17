import express from 'express';
import dotenv from 'dotenv';
import { usersRouter } from './routes/users.routes.js';
import { response400Object } from '@repo/votura-validators';
import logger from './logger.js';
import pinoHttp from 'pino-http';
import { auth } from './middlewares/auth.js';
import { electionsRouter } from './routes/elections.routes.js';
import { HttpStatusCode } from './httpStatusCode.js';

dotenv.config();

export const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parse JSON bodies
app.use(pinoHttp.pinoHttp({ logger }));

app.use('/users', usersRouter);
app.use('/elections', [auth, electionsRouter]);
// Fallback for unhandled routes
app.use((_req, res) => {
  res.status(HttpStatusCode.BadRequest).json(response400Object.parse({}));
});
