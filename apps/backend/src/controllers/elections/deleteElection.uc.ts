import { response404Object, type Election, type Response404 } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { deleteElection as deletePersistentElection } from '../../services/elections.service.js';

export const deleteElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<void | Response404>,
): Promise<void> => {
  const result = await deletePersistentElection(req.params.electionId);
  if (result.numDeletedRows < 1n) {
    res
      .status(HttpStatusCode.notFound)
      .json(
        response404Object.parse({ message: 'The provided election for deletion was not found.' }),
      );
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};
