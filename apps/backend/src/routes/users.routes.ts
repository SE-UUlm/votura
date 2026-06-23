import { Router } from 'express';
import {
  createUser,
  deleteUser,
  login,
  logout,
  refreshTokens,
  requestPasswordReset,
  resetPassword,
} from '../controllers/users.controllers.js';
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
usersRouter.delete(
  '/',
  acceptHeaderCheck(MimeType.applicationJson),
  authenticateAccessToken,
  deleteUser,
);
usersRouter.post(
  '/login',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  login,
);
usersRouter.post(
  '/refreshTokens',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  refreshTokens,
);
usersRouter.post(
  '/logout',
  acceptHeaderCheck(MimeType.applicationJson),
  authenticateAccessToken,
  logout,
);
usersRouter.post(
  '/requestPasswordReset',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  requestPasswordReset,
);
usersRouter.post(
  '/resetPassword',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  resetPassword,
);
