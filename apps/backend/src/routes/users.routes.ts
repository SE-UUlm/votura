import { Router } from 'express';
import { changePassword } from '../controllers/users/changePassword.uc.js';
import { createUser } from '../controllers/users/createUser.uc.js';
import { deleteUser } from '../controllers/users/deleteUser.uc.js';
import { getUserCount } from '../controllers/users/getUserCount.uc.js';
import { login } from '../controllers/users/login.uc.js';
import { logout } from '../controllers/users/logout.uc.js';
import { refreshTokens } from '../controllers/users/refreshTokens.uc.js';
import { requestPasswordReset } from '../controllers/users/requestPasswordReset.uc.js';
import { resetPassword } from '../controllers/users/resetPassword.uc.js';
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
usersRouter.get('/count', acceptHeaderCheck(MimeType.applicationJson), getUserCount);
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
  '/changePassword',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  authenticateAccessToken,
  changePassword,
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
usersRouter.post(
  '/logout',
  acceptHeaderCheck(MimeType.applicationJson),
  authenticateAccessToken,
  logout,
);
