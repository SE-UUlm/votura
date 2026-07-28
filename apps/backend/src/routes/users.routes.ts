import { Router } from 'express';
import { createUser } from '../controllers/users/createUser.uc.js';
import { deleteUser } from '../controllers/users/deleteUser.uc.js';
import { login } from '../controllers/users/login.uc.js';
import { logout } from '../controllers/users/logout.uc.js';
import { refreshTokens } from '../controllers/users/refreshTokens.uc.js';
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
