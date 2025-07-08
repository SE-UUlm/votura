import {
  parameter,
  response400Object,
  selectableCandidateObject,
  type ApiTokenUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { brokenCandidate, demoCandidate, demoElection, demoUser } from '../mockData.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`POST /elections/:${parameter.electionId}/candidates`, () => {
  let requestPath = '';
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

    requestPath = `/elections/${election.id}/candidates`;
    tokens = generateUserTokens(user.id);
  });

  it('201: should create a candidate', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoCandidate);
    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.type).toBe('application/json');
    const parseResult = selectableCandidateObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.title).toBe(demoCandidate.title);
      expect(parseResult.data.description).toBe(demoCandidate.description);
    }
  });
  it('400: should throw error empty title fields', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(brokenCandidate);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
