import { logger } from '@repo/logger';
import type { Election, SelectableElection } from '@repo/votura-validators';
import { getKeyPair } from '@votura/votura-crypto/index';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  clearKeyGenStartedAt,
  freezeElection as freezePersistentElection,
  setElectionKeys,
} from '../../services/elections.service.js';

export const freezeElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection>,
): Promise<void> => {
  const { election, keyGenStartedAt } = await freezePersistentElection(req.params.electionId);
  res.status(HttpStatusCode.ok).json(election);

  void (async (): Promise<void> => {
    try {
      logger.info(election, 'Starting the key generation process');
      const bitsPrimeP = parseInt(process.env.BITS_PRIME_P ?? '2048', 10);
      const keyPair = await getKeyPair(bitsPrimeP);
      const updatedElection = await setElectionKeys(keyPair, election.id, keyGenStartedAt);

      if (updatedElection === null) {
        logger.warn(
          election,
          'Discarded stale key generation result (election was unfrozen or re-frozen in the meantime)',
        );
        return;
      }

      logger.info(updatedElection, 'Key generation process completed');
    } catch (error: unknown) {
      logger.error({ err: error, election }, 'Key generation process failed');
      try {
        // Clear the marker so the election can be unfrozen again immediately.
        await clearKeyGenStartedAt(election.id, keyGenStartedAt);
      } catch (clearError: unknown) {
        // If this also fails, the unfreeze is unlocked by the key generation timeout instead.
        logger.error(
          { err: clearError, election },
          'Failed to clear the key generation marker after a failed key generation',
        );
      }
    }
  })();
};
