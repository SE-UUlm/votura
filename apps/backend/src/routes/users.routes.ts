import { Router } from 'express';
import { getUserById, getUsers, createUser } from '../controllers/users.controllers.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { MimeType } from '../middlewares/utils.js';

export const usersRouter: Router = Router();

usersRouter.get('/', [getUsers]);
usersRouter.get('/:id', [getUserById]);
usersRouter.post(
  '/',
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  createUser,
);
