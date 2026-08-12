import { parameter } from '@repo/votura-validators';
import { Router } from 'express';
import { changePassword } from '../controllers/users/changePassword.uc.js';
import { deleteUser } from '../controllers/users/deleteUser.uc.js';
import { editUser } from '../controllers/users/editUser.uc.js';
import { getUser } from '../controllers/users/getUser.uc.js';
import { getUserCount } from '../controllers/users/getUserCount.uc.js';
import { getUsers } from '../controllers/users/getUsers.uc.js';
import { login } from '../controllers/users/login.uc.js';
import { logout } from '../controllers/users/logout.uc.js';
import { refreshTokens } from '../controllers/users/refreshTokens.uc.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { authenticateAccessToken, onlyAdmin } from '../middlewares/auth.js';
import { MimeType } from '../middlewares/utils.js';
import { createUser } from '../services/users.service.js';

export const usersRouter: Router = Router();

usersRouter.get('/count', acceptHeaderCheck(MimeType.applicationJson), getUserCount);

usersRouter.get(
  '/',
  acceptHeaderCheck(MimeType.applicationJson),
  authenticateAccessToken,
  onlyAdmin,
  getUsers,
);
usersRouter.post(
  '/',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  authenticateAccessToken,
  onlyAdmin,
  createUser,
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
  '/changePassword',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  authenticateAccessToken,
  changePassword,
);
usersRouter.post(
  '/logout',
  acceptHeaderCheck(MimeType.applicationJson),
  authenticateAccessToken,
  logout,
);

usersRouter.get(
  `/:${parameter.userId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  authenticateAccessToken,
  getUser,
);
usersRouter.post(
  `/:${parameter.userId}`,
  acceptBodyCheck(MimeType.applicationJson),
  authenticateAccessToken,
  onlyAdmin,
  editUser,
);
usersRouter.delete(
  `/:${parameter.userId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  authenticateAccessToken,
  onlyAdmin,
  deleteUser,
);
