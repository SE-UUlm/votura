import { parameter, type ApiTokenUser, type SelectableCandidate } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoCandidate, demoElection, demoUser } from '../mockData.js';
import { createCandidate, getCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`DELETE /elections/:${parameter.electionId}/candidates/:${parameter.candidateId}`, () => {
  let requestPath = '';
  let candidate: SelectableCandidate | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    if (election === null) {
      throw new Error('Failed to create test election');
    }

    candidate = await createCandidate(demoCandidate, election.id);
    if (candidate === null) {
      throw new Error('Failed to create test candidate');
    }

    requestPath = `/elections/${election.id}/candidates/${candidate.id}`;
    tokens = generateUserTokens(user.id);
  });

  it('204: should delete a candidate', async () => {
    const res = await request(app)
      .delete(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.NoContent);
    if (candidate?.id === undefined) {
      throw new Error('Candidate ID is undefined');
    }
    const dbResult = await getCandidate(candidate?.id);
    expect(dbResult).toBeNull();
  });
});
