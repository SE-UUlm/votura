import { Router } from 'express';
import { getUserById, getUsers } from '../controllers/users.controllers.js';

export const usersRouter: Router = Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUserById);
