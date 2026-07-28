import type { SelectableUser, SelectableVoterGroup } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { generateRSAKeyPair } from '../../auth/generateJWTKeyPair.js';
import { JWT_CONFIG } from '../../auth/jwtConfig.js';
import type { VoterJwtPayload } from '../../auth/types.js';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  getVoterIdsForVoterGroup,
  updateVoterGroupPubKey,
} from '../../services/voterGroups.service.js';

export const createVoterTokens = async (
  req: Request<{ voterGroupId: SelectableVoterGroup['id'] }>,
  res: Response<string[], { user: SelectableUser }>,
): Promise<void> => {
  const { privateKey, publicKey } = generateRSAKeyPair();

  const voterIds = await getVoterIdsForVoterGroup(req.params.voterGroupId);
  const voterTokens: string[] = [];
  for (const voterId of voterIds) {
    const tokenPayload: VoterJwtPayload = {
      sub: voterId,
    };
    const votingToken = jwt.sign(tokenPayload, privateKey, {
      algorithm: JWT_CONFIG.algorithm,
    });
    voterTokens.push(votingToken);
  }
  await updateVoterGroupPubKey(req.params.voterGroupId, publicKey);

  res.status(HttpStatusCode.ok).send(voterTokens);
};
