import { Router, type Request, type Response} from 'express';
//import { getUserById, getUsers, signup , type UserSignupRequestBody} from '../controllers/users.controllers.js';
import { signup , type UserSignupRequestBody} from '../controllers/users.controllers.js';
export const usersRouter: Router = Router();

//usersRouter.get('/', getUsers);
//usersRouter.get('/:id', getUserById);
//
usersRouter.post('/user', (req, res) => {
    async (req: Request<UserSignupRequestBody>, res: Response) => {
        return signup(req, res);
    }
});