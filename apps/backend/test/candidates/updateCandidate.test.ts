import {
  parameter,
  response400Object,
  selectableCandidateObject,
  type SelectableCandidate,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  brokenCandidate,
  DEMO_TOKEN,
  demoCandidate,
  demoCandidate2,
  demoElection,
  demoUser,
} from '../mockData.js';
import { createCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}/candidates/:${parameter.candidateId}`, () => {
  let requestPath = '';
  let invalidUuidPath = '';
  let noExistingCandidatePath = '';
  let wrongOwnerPath = '';
  let candidate: SelectableCandidate | null = null;

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
  });

  it('200: should update a candidate for an election', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', DEMO_TOKEN)
      .send(demoCandidate2);
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableCandidateObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(candidate?.id);
      expect(parseResult.data.electionId).toBe(candidate?.electionId);
      expect(parseResult.data.title).toBe(demoCandidate2.title);
      expect(parseResult.data.description).toBe(demoCandidate2.description);
    }
  });
  it('400: should return 400 when candidate input is invalid', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', DEMO_TOKEN)
      .send(brokenCandidate);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
