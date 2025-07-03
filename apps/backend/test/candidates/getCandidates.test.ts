import { parameter, selectableCandidateObject } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { DEMO_TOKEN, demoCandidate, demoCandidate2, demoElection, demoUser } from '../mockData.js';
import { createCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`GET /elections/:${parameter.electionId}/candidates`, () => {
  let requestPath = '';

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

    const candidate = await createCandidate(demoCandidate, election.id);
    const candidate2 = await createCandidate(demoCandidate2, election.id);
    if (candidate === null || candidate2 === null) {
      throw new Error('Failed to create test candidate');
    }

    requestPath = `/elections/${election.id}/candidates`;
  });

  it('200: should get all ballot papers sections for an election', async () => {
    const res = await request(app).get(requestPath).set('Authorization', DEMO_TOKEN);
    expect(res.status).toBe(HttpStatusCode.Ok);
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
