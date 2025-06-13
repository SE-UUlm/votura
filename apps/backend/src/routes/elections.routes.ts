import { Router } from 'express';
import { createElection } from '../controllers/elections.controllers.js';

export const electionsRouter: Router = Router();

electionsRouter.post('/', createElection);
