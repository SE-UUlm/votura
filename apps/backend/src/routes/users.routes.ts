import { Router } from 'express';
import { createUser, login, logout, refreshTokens } from '../controllers/users.controllers.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { authenticateAccessToken } from '../middlewares/auth.js';
import { MimeType } from '../middlewares/utils.js';

export const usersRouter: Router = Router();

usersRouter.post(
  '/',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
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
  authenticateAccessToken,
  logout,
);
