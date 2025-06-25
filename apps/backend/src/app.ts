import { response400Object } from '@repo/votura-validators';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pinoHttp from 'pino-http';
import { HttpStatusCode } from './httpStatusCode.js';
import logger from './logger.js';
import { auth } from './middlewares/auth.js';
import { electionsRouter } from './routes/elections.routes.js';
import { usersRouter } from './routes/users.routes.js';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parse JSON bodies
app.use(pinoHttp.pinoHttp({ logger }));

app.use('/users', usersRouter);
app.use('/elections', [auth, electionsRouter]);
// Fallback for unhandled routes
app.use((_req, res) => {
  res
    .status(HttpStatusCode.BadRequest)
    .json(
      response400Object.parse({ message: 'Invalid request! The requested route does not exist.' }),
    );
});
