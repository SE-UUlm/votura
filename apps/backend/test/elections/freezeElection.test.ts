import {
  parameter,
  response403Object,
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
import { demoElection, demoUser } from '../mockData.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}/freeze`, () => {
  let requestPath = '';
  let election: SelectableElection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

    requestPath = `/elections/${election.id}/freeze`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should freeze an election & generate keys', { timeout: 120000 }, async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    let parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);

    expect(parseResult.data?.id).toBe(election?.id);
    expect(parseResult.data?.configFrozen).toBe(true);

    while (parseResult.data?.pubKey === undefined) {
      await sleep(5000);
      const res2 = await request(app)
        .get(`/elections/${election?.id}`)
        .set('Authorization', DEMO_TOKEN);
      parseResult = selectableElectionObject.safeParse(res2.body);
    }

    expect(parseResult.data?.pubKey).toBeTypeOf('string');
    expect(parseResult.data?.primeP).toBeTypeOf('string');
    expect(parseResult.data?.primeQ).toBeTypeOf('string');
    expect(parseResult.data?.generator).toBeTypeOf('string');
  });
  it('403: should not allow freezing a second time', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.Forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
