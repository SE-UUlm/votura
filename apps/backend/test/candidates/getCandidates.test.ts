import { parameter, selectableCandidateObject, type ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoCandidate, demoCandidate2, demoElection, demoUser } from '../mockData.js';
import { createCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`GET /elections/:${parameter.electionId}/candidates`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    await createCandidate(demoCandidate, election.id);
    await createCandidate(demoCandidate2, election.id);

    requestPath = `/elections/${election.id}/candidates`;
    tokens = generateUserTokens(user.id);
  });

  it('200: should get all candidates for an election', async () => {
    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');

    const arrBody = res.body as unknown[];
    expect(arrBody).toBeInstanceOf(Array);
    expect(arrBody.length).toBe(2);

    const candidates = await Promise.all(
      arrBody.map((candidate) => selectableCandidateObject.safeParseAsync(candidate)),
    );

    candidates.forEach((candidate) => {
      expect(candidate.success).toBe(true);
    });
  });
});
