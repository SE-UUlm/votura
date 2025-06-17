import { Router } from 'express';
import {
  getUserById,
  getUsers,
  createUser,
  login,
  refreshTokens,
  logout,
} from '../controllers/users.controllers.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { MimeType } from '../middlewares/utils.js';
import { authenticateAccessToken } from '../middlewares/auth.js';

export const usersRouter: Router = Router();

usersRouter.get('/', [getUsers]);
usersRouter.get('/:id', [getUserById]); // Not part of the API specification, but useful for debugging
usersRouter.post(
  '/',
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  createUser,
);
usersRouter.post(
  '/login',
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  login,
);
usersRouter.post(
  '/refreshTokens',
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  refreshTokens,
);
usersRouter.post(
  '/logout',
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  authenticateAccessToken,
  logout,
);
