import { logger } from '@repo/logger';
import type { Election, SelectableElection } from '@repo/votura-validators';
import { getKeyPair } from '@votura/votura-crypto/index';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  freezeElection as freezePersistentElection,
  setElectionKeys,
} from '../../services/elections.service.js';

export const freezeElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection>,
): Promise<void> => {
  let election = await freezePersistentElection(req.params.electionId);
  res.status(HttpStatusCode.ok).json(election);

  void (async (): Promise<void> => {
    logger.info(election, 'Starting the key generation process');
    const bitsPrimeP = parseInt(process.env.BITS_PRIME_P ?? '2048', 10);
    const keyPair = await getKeyPair(bitsPrimeP);
    election = await setElectionKeys(keyPair, election.id);
    logger.info(election, 'Key generation process completed');
  })();
};
