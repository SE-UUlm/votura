import {
  parameter,
  response400Object,
  response404Object,
  selectableCandidateObject,
  type SelectableCandidate,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoCandidate, demoCandidate2, demoElection, demoUser, demoUser2 } from '../mockData.js';
import { createCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`GET /elections/:${parameter.electionId}/candidates/:${parameter.candidateId}`, () => {
  let requestPath = '';
  let invalidUuidPath = '';
  let noExistingCandidatePath = '';
  let wrongOwnerPath = '';
  let candidate: SelectableCandidate | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const user = await findUserBy({ email: demoUser.email });
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user === null || user2 === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    const election2 = await createElection(demoElection, user2.id);
    if (election === null || election2 === null) {
      throw new Error('Failed to create test election');
    }

    candidate = await createCandidate(demoCandidate, election.id);
    const candidate2 = await createCandidate(demoCandidate2, election2.id);
    if (candidate === null || candidate2 === null) {
      throw new Error('Failed to create test candidate');
    }

    requestPath = `/elections/${election.id}/candidates/${candidate.id}`;
    invalidUuidPath = `/elections/${election.id}/candidates/1234-my-UUID`;
    noExistingCandidatePath = `/elections/${election.id}/candidates/d0e4ff31-5d73-4781-b31c-afb75d504d25`;
    wrongOwnerPath = `/elections/${election.id}/candidates/${candidate2.id}`;
    tokens = generateUserTokens(user.id);
  });

  it('200: should get a candidate for an election', async () => {
    const res = await request(app).get(requestPath).set('Authorization', tokens.accessToken);
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableCandidateObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(candidate?.id);
      expect(parseResult.data.electionId).toBe(candidate?.electionId);
      expect(parseResult.data.title).toBe(demoCandidate.title);
      expect(parseResult.data.description).toBe(demoCandidate.description);
    }
  });
  it('400: should return 400 when candidate id is invalid', async () => {
    const res = await request(app).get(invalidUuidPath).set('Authorization', tokens.accessToken);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: should return 404 when candidate not exists', async () => {
    const res = await request(app)
      .get(noExistingCandidatePath)
      .set('Authorization', tokens.accessToken);
    expect(res.status).toBe(HttpStatusCode.NotFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: should return 400 when election is not the parent of candidate', async () => {
    const res = await request(app).get(wrongOwnerPath).set('Authorization', tokens.accessToken);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
