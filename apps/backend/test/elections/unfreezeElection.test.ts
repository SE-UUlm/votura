import {
  parameter,
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
import { sleep } from '../utils.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}/unfreeze`, () => {
  let freezePath = '';
  let unfreezePath = '';
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

    freezePath = `/elections/${election.id}/freeze`;
    unfreezePath = `/elections/${election.id}/unfreeze`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should unfreeze a frozen election', { timeout: 120000 }, async () => {
    const res1 = await request(app)
      .put(freezePath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    let parseResult = selectableElectionObject.safeParse(res1.body);

    while (parseResult.data?.pubKey === undefined) {
      await sleep(5000);
      const res2 = await request(app)
        .get(`/elections/${election?.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      parseResult = selectableElectionObject.safeParse(res2.body);
    }

    const res = await request(app)
      .put(unfreezePath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(election?.id);
      expect(parseResult.data.configFrozen).toBe(false);
      expect(parseResult.data.pubKey).toBe(undefined);
      expect(parseResult.data.primeP).toBe(undefined);
      expect(parseResult.data.primeQ).toBe(undefined);
      expect(parseResult.data.generator).toBe(undefined);
    }
  });
  it('403: should not unfreeze an election that is generating keys.', async () => {
    await request(app).put(freezePath).set('Authorization', `Bearer ${tokens.accessToken}`);
    const res = await request(app)
      .put(unfreezePath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
  });
});
