import {
  parameter,
  response400Object,
  selectableElectionObject,
  type ApiTokenUser,
  type SelectableElection,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { brokenElection, demoElection, demoElection2, demoUser } from '../mockData.js';
import { sleep } from '../utils.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}`, () => {
  let requestPath = '';
  let election: SelectableElection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(demoElection, user.id);
    if (election === null) {
      throw new Error('Failed to create test election');
    }

    requestPath = `/elections/${election.id}`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should update an election and checks modifiedAt update', async () => {
    // get the modifiedAt date before the update
    if (election === null) {
      throw new Error('Election is null, cannot proceed with test');
    }
    const initialModifiedAt = new Date(election.modifiedAt);

    // Wait so that the modifiedAt date is different
    await sleep(2000);
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoElection2);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(election?.id);
      expect(parseResult.data.name).toBe(demoElection2.name);
      expect(parseResult.data.description).toBe(demoElection2.description);
      expect(parseResult.data.private).toBe(demoElection2.private);
      expect(parseResult.data.modifiedAt).toBeDefined();
      expect(new Date(parseResult.data.modifiedAt).getTime()).toBeGreaterThan(
        initialModifiedAt.getTime(),
      );
    }
  });
  it('400: should complain about wrong input data', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(brokenElection);
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
